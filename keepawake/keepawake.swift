#!/usr/bin/env swift
#if os(macOS)
import Darwin
import Foundation
import IOKit
import IOKit.ps
import IOKit.pwr_mgt

// keepawake.swift
//
// Lightweight closed-lid keep-alive for a personal MacBook used headless in
// transit. Holds IOKit power assertions, optionally flips Apple's pmset
// `disablesleep` lever (the only public setting that survives lid-close with
// no external display), pings the network so Wi-Fi/hotspot radios stay
// associated, and drops everything to sleep on low battery or high heat.
//
// IOKit assertions (IOPMAssertionCreateWithName) block *idle* sleep and
// display-idle sleep. They do NOT block clamshell sleep when the lid closes
// with no external monitor. That requires `pmset disablesleep`, which is
// privileged, persistent, and dangerous without the failsafes below.
//
// Permissions:
//   • No extra TCC / Full Disk Access / helper-tool approval for assertions,
//     ping, battery, or thermal pressure.
//   • Lid-closed operation without a monitor needs an administrator password
//     once to install helpers/keepawake-pmset (or a live `sudo pmset`).
//   • Passwordless sudo is scoped to THAT helper only so the 15% / 80 °C
//     failsafe can restore sleep from a bag with no TTY.
//   • `caffeinate` is not required; this file talks to IOKit directly.

private let version = "1.0.0"
private let armedFlagName = "armed"
private let heartbeatName = "heartbeat"
private let pidFileName = "keepawake.pid"
private let logFileName = "keepawake.log"

// MARK: - Config

private struct Config {
    var lidOverride = false
    var bagProfile = false
    var holdDisplayAssertion = true
    var batteryFloorPercent = 15
    var maxTempC = 80.0
    var pingIntervalSeconds: UInt32 = 30
    var pingHosts = ["1.1.1.1", "8.8.8.8"]
    var maxPingFailuresBeforeReassociate = 2
    var maxReassociateBeforePowerCycle = 3
    var thermalPressureLimit = 2 // 0 nominal, 1 moderate, 2 heavy, 3 trapping, 4 sleeping
    var foreground = true
    var statusOnly = false
    var stopOnly = false
    var restoreOnly = false

    static func parse(_ args: [String]) -> Config {
        var c = Config()
        var i = 1
        while i < args.count {
            switch args[i] {
            case "--bag":
                c.bagProfile = true
                c.lidOverride = true
                c.holdDisplayAssertion = false
            case "--lid-override":
                c.lidOverride = true
            case "--no-lid-override":
                c.lidOverride = false
            case "--no-display-assertion":
                c.holdDisplayAssertion = false
            case "--display-assertion":
                c.holdDisplayAssertion = true
            case "--battery-floor":
                i += 1
                c.batteryFloorPercent = Int(args.value(i, flag: "--battery-floor")) ?? c.batteryFloorPercent
            case "--max-temp":
                i += 1
                c.maxTempC = Double(args.value(i, flag: "--max-temp")) ?? c.maxTempC
            case "--interval":
                i += 1
                c.pingIntervalSeconds = UInt32(args.value(i, flag: "--interval")) ?? c.pingIntervalSeconds
            case "--status":
                c.statusOnly = true
            case "--stop":
                c.stopOnly = true
            case "--restore-sleep":
                c.restoreOnly = true
            case "--foreground":
                c.foreground = true
            case "-h", "--help":
                printHelpAndExit()
            case "--version":
                fputs("keepawake \(version)\n", stdout)
                exit(0)
            default:
                fputs("unknown argument: \(args[i])\n", stderr)
                exit(2)
            }
            i += 1
        }
        return c
    }
}

extension Array where Element == String {
    fileprivate func value(_ index: Int, flag: String) -> String {
        guard index < count else {
            fputs("\(flag) requires a value\n", stderr)
            exit(2)
        }
        return self[index]
    }
}

private func printHelpAndExit() -> Never {
    let text = """
    keepawake \(version) — macOS closed-lid / transit keep-alive

    Usage:
      keepawake.swift [--bag] [--lid-override] [--no-display-assertion]
                      [--battery-floor 15] [--max-temp 80] [--interval 30]
      keepawake.swift --status
      keepawake.swift --stop
      keepawake.swift --restore-sleep

    Profiles:
      --bag     Transit-bag defaults: lid-override ON, display assertion OFF
                (panel stays dark; less heat), battery/thermal failsafes ON.

    Sleep prevention:
      IOKit IOPMAssertionCreateWithName holds PreventUserIdleSystemSleep,
      PreventSystemSleep, and optionally PreventUserIdleDisplaySleep.
      Assertions do not survive lid-close without an external display.
      --lid-override uses pmset disablesleep via the privileged helper.

    Safety:
      Battery ≤ floor  → release assertions, restore sleep, `pmset sleepnow`
      SoC/pack ≥ max °C or thermal pressure ≥ heavy → same failsafe
    """
    fputs(text + "\n", stdout)
    exit(0)
}

// MARK: - Paths / logging

private func supportDirectory() -> URL {
    let base = FileManager.default.homeDirectoryForCurrentUser
        .appendingPathComponent("Library/Application Support/keepawake")
    try? FileManager.default.createDirectory(at: base, withIntermediateDirectories: true)
    return base
}

private func logFileURL() -> URL {
    FileManager.default.homeDirectoryForCurrentUser
        .appendingPathComponent("Library/Logs")
        .appendingPathComponent(logFileName)
}

private func log(_ message: String) {
    let stamp = ISO8601DateFormatter().string(from: Date())
    let line = "\(stamp)  \(message)\n"
    fputs(line, stdout)
    fflush(stdout)
    let url = logFileURL()
    try? FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
    if let data = line.data(using: .utf8) {
        if FileManager.default.fileExists(atPath: url.path) {
            if let handle = try? FileHandle(forWritingTo: url) {
                defer { try? handle.close() }
                handle.seekToEndOfFile()
                handle.write(data)
            }
        } else {
            try? data.write(to: url)
        }
    }
}

private func notifyUser(_ subtitle: String, body: String) {
    let script = """
    display notification \(body.jsonEscaped) with title "keepawake" subtitle \(subtitle.jsonEscaped)
    """
    _ = run("/usr/bin/osascript", ["-e", script], capture: true)
}

private extension String {
    var jsonEscaped: String {
        let escaped = replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "\"", with: "\\\"")
        return "\"\(escaped)\""
    }
}

// MARK: - Subprocess

@discardableResult
private func run(_ launchPath: String, _ arguments: [String], capture: Bool = false, sudo: Bool = false) -> (Int32, String) {
    let proc = Process()
    if sudo {
        proc.executableURL = URL(fileURLWithPath: "/usr/bin/sudo")
        proc.arguments = ["-n", launchPath] + arguments
    } else {
        proc.executableURL = URL(fileURLWithPath: launchPath)
        proc.arguments = arguments
    }
    let pipe = Pipe()
    if capture {
        proc.standardOutput = pipe
        proc.standardError = pipe
    } else {
        proc.standardOutput = FileHandle.nullDevice
        proc.standardError = FileHandle.nullDevice
    }
    do {
        try proc.run()
        proc.waitUntilExit()
    } catch {
        return (127, "launch failed: \(error)")
    }
    var output = ""
    if capture {
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        output = String(data: data, encoding: .utf8) ?? ""
    }
    return (proc.terminationStatus, output)
}

// MARK: - Privileged pmset helper

private enum SleepOverride {
    static var helperPath: String {
        "/usr/local/libexec/keepawake-pmset"
    }

    static func helperInstalled() -> Bool {
        FileManager.default.isExecutableFile(atPath: helperPath)
    }

    /// Non-interactive: succeeds only with the NOPASSWD sudoers drop-in or a cached timestamp.
    @discardableResult
    static func invoke(_ verb: String) -> Bool {
        if helperInstalled() {
            let (status, output) = run(helperPath, [verb], capture: true, sudo: true)
            if status == 0 { return true }
            log("helper \(verb) failed (\(status)): \(output.trimmingCharacters(in: .whitespacesAndNewlines))")
        }
        switch verb {
        case "disable-sleep":
            return run("/usr/bin/pmset", ["-a", "disablesleep", "1"], capture: true, sudo: true).0 == 0
        case "enable-sleep":
            return run("/usr/bin/pmset", ["-a", "disablesleep", "0"], capture: true, sudo: true).0 == 0
        case "sleep-now":
            _ = run("/usr/bin/pmset", ["-a", "disablesleep", "0"], capture: true, sudo: true)
            return run("/usr/bin/pmset", ["sleepnow"], capture: true, sudo: true).0 == 0
                || run("/usr/bin/pmset", ["sleepnow"], capture: true).0 == 0
        case "status":
            return true
        default:
            return false
        }
    }

    static func sleepDisabled() -> Bool? {
        let (ps, out) = run("/usr/bin/pmset", ["-g"], capture: true)
        guard ps == 0 else { return nil }
        for line in out.split(separator: "\n") {
            if line.lowercased().contains("sleepdisabled") {
                return line.split(whereSeparator: { $0.isWhitespace }).last == "1"
            }
        }
        return false
    }

    static func canToggleNonInteractive() -> Bool {
        if helperInstalled() {
            return run(helperPath, ["status"], capture: true, sudo: true).0 == 0
        }
        return run("/usr/bin/pmset", ["-g"], capture: true, sudo: true).0 == 0
    }
}

// MARK: - IOKit power assertions

private final class AssertionHolder {
    private var ids: [IOPMAssertionID] = []

    func acquire(display: Bool) throws {
        try create(kIOPMAssertionTypePreventUserIdleSystemSleep, "keepawake: prevent idle system sleep")
        try create(kIOPMAssertionTypePreventSystemSleep, "keepawake: prevent system sleep")
        if display {
            try create(kIOPMAssertionTypePreventUserIdleDisplaySleep, "keepawake: prevent display-idle sleep")
        }
        log("IOKit assertions held: \(ids.count) (display-idle=\(display))")
    }

    func releaseAll() {
        for id in ids {
            IOPMAssertionRelease(id)
        }
        if !ids.isEmpty {
            log("released \(ids.count) IOKit assertion(s)")
        }
        ids.removeAll()
    }

    deinit { releaseAll() }

    private func create(_ type: String, _ reason: String) throws {
        var assertionID: IOPMAssertionID = 0
        let kr = IOPMAssertionCreateWithName(
            type as CFString,
            IOPMAssertionLevel(kIOPMAssertionLevelOn),
            reason as CFString,
            &assertionID
        )
        guard kr == kIOReturnSuccess else {
            throw KeepawakeError.assertionFailed(type: type, kr: kr)
        }
        ids.append(assertionID)
    }
}

private enum KeepawakeError: Error, CustomStringConvertible {
    case assertionFailed(type: String, kr: IOReturn)
    case alreadyRunning(pid: Int32)
    case lidOverrideUnavailable

    var description: String {
        switch self {
        case .assertionFailed(let type, let kr):
            return "IOPMAssertionCreateWithName(\(type)) failed: \(kr)"
        case .alreadyRunning(let pid):
            return "already running (pid \(pid)); stop it first"
        case .lidOverrideUnavailable:
            return """
            --lid-override / --bag needs a non-interactive admin path so the \
            failsafe can restore sleep inside a bag.
            Install the helper (see README) or run: sudo -v && keepawake.swift --bag
            """
        }
    }
}

// MARK: - Battery

private struct BatteryStatus {
    var percent: Int?
    var charging: Bool
    var present: Bool
    var packTempC: Double?
}

private func readBattery() -> BatteryStatus {
    var status = BatteryStatus(percent: nil, charging: false, present: false, packTempC: nil)

    if let blob = IOPSCopyPowerSourcesInfo()?.takeRetainedValue(),
       let list = IOPSCopyPowerSourcesList(blob)?.takeRetainedValue() as? [CFTypeRef] {
        for source in list {
            guard let raw = IOPSGetPowerSourceDescription(blob, source)?.takeUnretainedValue() as? [String: Any] else {
                continue
            }
            let type = raw[kIOPSTypeKey] as? String
            if type != kIOPSInternalBatteryType { continue }
            status.present = true
            status.charging = (raw[kIOPSIsChargingKey] as? Bool) ?? false
            if let current = raw[kIOPSCurrentCapacityKey] as? Int,
               let max = raw[kIOPSMaxCapacityKey] as? Int, max > 0 {
                status.percent = Int((Double(current) / Double(max) * 100.0).rounded())
            } else if let current = raw[kIOPSCurrentCapacityKey] as? Int {
                status.percent = current
            }
        }
    }

    status.packTempC = appleSmartBatteryTemperatureC()
    return status
}

private func ioMainPort() -> mach_port_t {
    if #available(macOS 12.0, *) {
        return kIOMainPortDefault
    }
    return kIOMasterPortDefault
}

private func appleSmartBatteryTemperatureC() -> Double? {
    let service = IOServiceGetMatchingService(ioMainPort(), IOServiceMatching("AppleSmartBattery"))
    guard service != 0 else { return nil }
    defer { IOObjectRelease(service) }
    guard let raw = IORegistryEntryCreateCFProperty(
        service,
        "Temperature" as CFString,
        kCFAllocatorDefault,
        0
    )?.takeRetainedValue() else { return nil }

    let value: Double
    if let n = raw as? NSNumber {
        value = n.doubleValue
    } else {
        return nil
    }
    // Intel-era SMC reported centi-°C (3015 → 30.15 °C). Apple Silicon often
    // reports whole °C. Treat large values as centi-degrees.
    return value > 200 ? value / 100.0 : value
}

// MARK: - Thermal

private struct ThermalStatus {
    var processInfoState: ProcessInfo.ThermalState
    var pressure: Int?          // Darwin notify: 0...4
    var hidMaxC: Double?        // Apple Silicon HID die/cluster sensors
    var packTempC: Double?

    var hottestC: Double? {
        [hidMaxC, packTempC].compactMap { $0 }.max()
    }

    var description: String {
        let pi: String
        switch processInfoState {
        case .nominal: pi = "nominal"
        case .fair: pi = "fair"
        case .serious: pi = "serious"
        case .critical: pi = "critical"
        @unknown default: pi = "unknown"
        }
        let p = pressure.map(String.init) ?? "n/a"
        let hid = hidMaxC.map { String(format: "%.1f°C", $0) } ?? "n/a"
        let pack = packTempC.map { String(format: "%.1f°C", $0) } ?? "n/a"
        return "thermalState=\(pi) pressure=\(p) hid=\(hid) pack=\(pack)"
    }
}

private func readThermal(packTempC: Double?) -> ThermalStatus {
    ThermalStatus(
        processInfoState: ProcessInfo.processInfo.thermalState,
        pressure: darwinThermalPressure(),
        hidMaxC: hidMaxTemperatureC(),
        packTempC: packTempC
    )
}

private func darwinThermalPressure() -> Int? {
    var token: Int32 = 0
    guard notify_register_check("com.apple.system.thermalpressurelevel", &token) == NOTIFY_STATUS_OK else {
        return nil
    }
    defer { notify_cancel(token) }
    var state: UInt64 = 0
    guard notify_get_state(token, &state) == NOTIFY_STATUS_OK else { return nil }
    return Int(state)
}

/// Apple Silicon die/cluster temperatures via IOHIDEventSystem (no root).
/// Symbols live in IOKit but are not in the public SDK; resolved with dlsym.
private func hidMaxTemperatureC() -> Double? {
    guard let iokit = dlopen("/System/Library/Frameworks/IOKit.framework/IOKit", RTLD_NOW) else {
        return nil
    }
    defer { dlclose(iokit) }

    typealias CreateFn = @convention(c) (CFAllocator?) -> UnsafeMutableRawPointer?
    typealias CopyServicesFn = @convention(c) (UnsafeMutableRawPointer?) -> Unmanaged<CFArray>?
    typealias CopyEventFn = @convention(c) (UnsafeMutableRawPointer?, Int32, Int32, Int32) -> UnsafeMutableRawPointer?
    typealias GetFloatFn = @convention(c) (UnsafeMutableRawPointer?, UInt32) -> Double
    typealias GetPropertyFn = @convention(c) (UnsafeMutableRawPointer?, CFString) -> Unmanaged<CFTypeRef>?

    func symbol(_ name: String) -> UnsafeMutableRawPointer? {
        dlsym(iokit, name)
    }

    guard
        let createSym = symbol("IOHIDEventSystemClientCreate"),
        let copyServicesSym = symbol("IOHIDEventSystemClientCopyServices"),
        let copyEventSym = symbol("IOHIDServiceClientCopyEvent"),
        let getFloatSym = symbol("IOHIDEventGetFloatValue"),
        let getPropSym = symbol("IOHIDServiceClientCopyProperty")
    else {
        return nil
    }

    let create = unsafeBitCast(createSym, to: CreateFn.self)
    let copyServices = unsafeBitCast(copyServicesSym, to: CopyServicesFn.self)
    let copyEvent = unsafeBitCast(copyEventSym, to: CopyEventFn.self)
    let getFloat = unsafeBitCast(getFloatSym, to: GetFloatFn.self)
    let getProp = unsafeBitCast(getPropSym, to: GetPropertyFn.self)

    let kIOHIDEventTypeTemperature: Int32 = 15
    let temperatureField: UInt32 = UInt32(kIOHIDEventTypeTemperature) << 16

    guard let client = create(kCFAllocatorDefault) else { return nil }
    guard let services = copyServices(client)?.takeRetainedValue() as? [UnsafeMutableRawPointer] else {
        return nil
    }

    var maxC: Double?
    for service in services {
        let page = (getProp(service, "PrimaryUsagePage" as CFString)?.takeRetainedValue() as? NSNumber)?.intValue
        let usage = (getProp(service, "PrimaryUsage" as CFString)?.takeRetainedValue() as? NSNumber)?.intValue
        // Apple PMU temperature services: usage page 0xFF00, usage 5.
        if let page, let usage, !(page == 0xFF00 && usage == 5) {
            continue
        }
        guard let event = copyEvent(service, kIOHIDEventTypeTemperature, 0, 0) else { continue }
        let celsius = getFloat(event, temperatureField)
        if celsius.isFinite, celsius > 0, celsius < 150 {
            maxC = max(maxC ?? celsius, celsius)
        }
    }
    return maxC
}

private enum Failsafe {
    case battery(percent: Int)
    case temperature(celsius: Double)
    case thermalPressure(level: Int)
    case thermalState(ProcessInfo.ThermalState)

    var reason: String {
        switch self {
        case .battery(let p): return "battery \(p)% below floor"
        case .temperature(let c): return String(format: "internal temperature %.1f°C exceeded limit", c)
        case .thermalPressure(let l): return "thermal pressure \(l) (heavy/trapping/sleeping)"
        case .thermalState(let s): return "ProcessInfo.thermalState=\(s.rawValue) (serious/critical)"
        }
    }
}

private func evaluateFailsafe(config: Config, battery: BatteryStatus, thermal: ThermalStatus) -> Failsafe? {
    if let pct = battery.percent, !battery.charging, pct <= config.batteryFloorPercent {
        return .battery(percent: pct)
    }
    if let hot = thermal.hottestC, hot >= config.maxTempC {
        return .temperature(celsius: hot)
    }
    if let pressure = thermal.pressure, pressure >= config.thermalPressureLimit {
        return .thermalPressure(level: pressure)
    }
    switch thermal.processInfoState {
    case .serious, .critical:
        return .thermalState(thermal.processInfoState)
    default:
        break
    }
    return nil
}

// MARK: - Network keep-alive

private final class NetworkKeepAlive {
    let hosts: [String]
    private var consecutiveFailures = 0
    private var reassociateAttempts = 0
    private var wifiDevice: String?
    private var lastSSID: String?

    init(hosts: [String]) {
        self.hosts = hosts
        self.wifiDevice = Self.detectWiFiDevice()
        self.lastSSID = wifiDevice.flatMap(Self.currentSSID(device:))
        log("network: device=\(wifiDevice ?? "n/a") ssid=\(lastSSID ?? "n/a") hosts=\(hosts.joined(separator: ","))")
    }

    func tick() {
        if pingAnyPublicHost() {
            consecutiveFailures = 0
            reassociateAttempts = 0
            if let device = wifiDevice, lastSSID == nil {
                lastSSID = Self.currentSSID(device: device)
            }
            return
        }

        consecutiveFailures += 1
        let gateway = defaultGateway()
        let gatewayAlive = gateway.map(Self.pingHost) ?? false
        log("network: public ping failed (\(consecutiveFailures)); gateway \(gateway ?? "n/a") alive=\(gatewayAlive)")

        if consecutiveFailures < 2 { return }

        notifyUser("Network dropped", body: "Public ping failed. Attempting Wi-Fi reassociate.")

        guard let device = wifiDevice else {
            log("network: no Wi-Fi device; cannot reassociate")
            return
        }

        if let ssid = lastSSID ?? Self.currentSSID(device: device) {
            lastSSID = ssid
            log("network: reassociating to \(ssid) on \(device)")
            _ = run("/usr/sbin/networksetup", ["-setairportnetwork", device, ssid], capture: true)
            reassociateAttempts += 1
            Thread.sleep(forTimeInterval: 3)
            if pingAnyPublicHost() {
                log("network: reassociate succeeded")
                consecutiveFailures = 0
                return
            }
        }

        if reassociateAttempts >= 3 {
            log("network: power-cycling Wi-Fi on \(device) (last resort)")
            notifyUser("Wi-Fi power-cycle", body: "Still offline after reassociate. Cycling \(device).")
            _ = run("/usr/sbin/networksetup", ["-setairportpower", device, "off"], capture: true)
            Thread.sleep(forTimeInterval: 2)
            _ = run("/usr/sbin/networksetup", ["-setairportpower", device, "on"], capture: true)
            reassociateAttempts = 0
            consecutiveFailures = 0
        }
    }

    private func pingAnyPublicHost() -> Bool {
        hosts.contains { Self.pingHost($0) }
    }

    static func pingHost(_ host: String) -> Bool {
        run("/sbin/ping", ["-c", "1", "-t", "2", host], capture: true).0 == 0
    }

    static func detectWiFiDevice() -> String? {
        let (_, out) = run("/usr/sbin/networksetup", ["-listallhardwareports"], capture: true)
        var pendingWiFi = false
        for line in out.components(separatedBy: "\n") {
            if line.contains("Wi-Fi") || line.contains("AirPort") {
                pendingWiFi = true
                continue
            }
            if pendingWiFi, line.hasPrefix("Device:") {
                return line.split(separator: " ").last.map(String.init)
            }
        }
        return nil
    }

    static func currentSSID(device: String) -> String? {
        let (_, out) = run("/usr/sbin/networksetup", ["-getairportnetwork", device], capture: true)
        let trimmed = out.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.lowercased().contains("not associated") { return nil }
        if let idx = trimmed.range(of: ": ") {
            let ssid = String(trimmed[idx.upperBound...]).trimmingCharacters(in: .whitespacesAndNewlines)
            return ssid.isEmpty ? nil : ssid
        }
        return nil
    }

    func defaultGateway() -> String? {
        let (_, out) = run("/sbin/route", ["-n", "get", "default"], capture: true)
        for line in out.components(separatedBy: "\n") {
            if line.contains("gateway:") {
                return line.split(whereSeparator: { $0.isWhitespace }).last.map(String.init)
            }
        }
        return nil
    }
}

// MARK: - PID / armed state

private func pidFileURL() -> URL { supportDirectory().appendingPathComponent(pidFileName) }
private func armedURL() -> URL { supportDirectory().appendingPathComponent(armedFlagName) }
private func heartbeatURL() -> URL { supportDirectory().appendingPathComponent(heartbeatName) }

private func runningPid() -> Int32? {
    guard let raw = try? String(contentsOf: pidFileURL()).trimmingCharacters(in: .whitespacesAndNewlines),
          let pid = Int32(raw) else { return nil }
    if kill(pid, 0) == 0 || errno == EPERM {
        return pid
    }
    return nil
}

private func writePid() {
    try? "\(getpid())\n".write(to: pidFileURL(), atomically: true, encoding: .utf8)
}

private func clearPid() {
    try? FileManager.default.removeItem(at: pidFileURL())
}

private func armSession() {
    try? "\(getpid()) \(ISO8601DateFormatter().string(from: Date()))\n"
        .write(to: armedURL(), atomically: true, encoding: .utf8)
    beat()
}

private func beat() {
    try? "\(Int(Date().timeIntervalSince1970))\n"
        .write(to: heartbeatURL(), atomically: true, encoding: .utf8)
}

private func disarmSession() {
    try? FileManager.default.removeItem(at: armedURL())
    try? FileManager.default.removeItem(at: heartbeatURL())
}

private func stopExisting() -> Bool {
    guard let pid = runningPid() else {
        log("no running keepawake process")
        return false
    }
    log("sending SIGTERM to pid \(pid)")
    kill(pid, SIGTERM)
    for _ in 0..<20 {
        if runningPid() == nil { return true }
        Thread.sleep(forTimeInterval: 0.25)
    }
    log("pid \(pid) still alive; sending SIGKILL")
    kill(pid, SIGKILL)
    return true
}

// MARK: - Main session

private final class Session {
    let config: Config
    let assertions = AssertionHolder()
    var network: NetworkKeepAlive!
    var lidArmed = false
    var stopping = false
    private var signalSources: [DispatchSourceSignal] = []

    init(config: Config) { self.config = config }

    func start() throws {
        if let pid = runningPid(), pid != getpid() {
            throw KeepawakeError.alreadyRunning(pid: pid)
        }

        reconcileLeftoverArm()

        if config.lidOverride {
            guard SleepOverride.canToggleNonInteractive() else {
                throw KeepawakeError.lidOverrideUnavailable
            }
            guard SleepOverride.invoke("disable-sleep") else {
                throw KeepawakeError.lidOverrideUnavailable
            }
            lidArmed = true
            log("lid-override ON (pmset disablesleep=1). This is persistent until we restore it.")
        } else {
            log("lid-override OFF. IOKit assertions will NOT keep the Mac awake after lid close without a monitor.")
        }

        do {
            try assertions.acquire(display: config.holdDisplayAssertion)
        } catch {
            if lidArmed { _ = SleepOverride.invoke("enable-sleep") }
            throw error
        }

        writePid()
        armSession()
        network = NetworkKeepAlive(hosts: config.pingHosts)
        installSignalHandlers()
        log("keepawake \(version) running pid=\(getpid()) bag=\(config.bagProfile) batteryFloor=\(config.batteryFloorPercent)% maxTemp=\(config.maxTempC)°C interval=\(config.pingIntervalSeconds)s")
        notifyUser("Armed", body: config.lidOverride
            ? "Sleep disabled. Failsafes: battery \(config.batteryFloorPercent)%, \(Int(config.maxTempC))°C."
            : "Idle-sleep assertions held (lid close may still sleep).")

        tick()
        while !stopping {
            sleep(config.pingIntervalSeconds)
            if stopping { break }
            tick()
        }
        cleanup(sleepNow: false)
    }

    func tick() {
        beat()
        let battery = readBattery()
        let thermal = readThermal(packTempC: battery.packTempC)
        let battText = battery.percent.map { "\($0)%" } ?? "n/a"
        log("status battery=\(battText) charging=\(battery.charging) \(thermal.description)")

        if let fail = evaluateFailsafe(config: config, battery: battery, thermal: thermal) {
            log("FAILSAFE: \(fail.reason)")
            notifyUser("Failsafe sleep", body: fail.reason)
            failsafeSleep(reason: fail.reason)
            return
        }

        network.tick()
    }

    func failsafeSleep(reason: String) {
        stopping = true
        assertions.releaseAll()
        if lidArmed || SleepOverride.sleepDisabled() == true {
            _ = SleepOverride.invoke("enable-sleep")
            lidArmed = false
        }
        disarmSession()
        clearPid()
        log("requesting pmset sleepnow (\(reason))")
        _ = SleepOverride.invoke("sleep-now")
        _ = run("/usr/bin/pmset", ["sleepnow"], capture: true)
        exit(0)
    }

    func cleanup(sleepNow: Bool) {
        assertions.releaseAll()
        if lidArmed {
            if SleepOverride.invoke("enable-sleep") {
                log("restored pmset disablesleep=0")
            } else {
                log("WARNING: could not restore disablesleep. Run: sudo pmset -a disablesleep 0")
                notifyUser("Sleep not restored", body: "Run: sudo pmset -a disablesleep 0")
            }
            lidArmed = false
        }
        disarmSession()
        clearPid()
        if sleepNow {
            _ = SleepOverride.invoke("sleep-now")
        }
        log("keepawake stopped")
    }

    func reconcileLeftoverArm() {
        guard FileManager.default.fileExists(atPath: armedURL().path) else { return }
        if let pid = runningPid(), pid != getpid() { return }
        log("found leftover armed flag with no live process; restoring sleep")
        _ = SleepOverride.invoke("enable-sleep")
        disarmSession()
        notifyUser("Recovered", body: "Previous session died still armed. Sleep restored.")
    }

    func installSignalHandlers() {
        signal(SIGINT, SIG_IGN)
        signal(SIGTERM, SIG_IGN)
        signal(SIGHUP, SIG_IGN)

        let sigs = [SIGINT, SIGTERM, SIGHUP]
        for sig in sigs {
            let src = DispatchSource.makeSignalSource(signal: sig, queue: .global(qos: .userInitiated))
            src.setEventHandler { [weak self] in
                guard let self, !self.stopping else { return }
                self.stopping = true
                log("caught signal \(sig); restoring default sleep")
                self.cleanup(sleepNow: false)
                exit(0)
            }
            src.resume()
            signalSources.append(src)
        }
    }
}

// MARK: - Status / restore / stop entry points

private func printStatus() {
    let pid = runningPid()
    let armed = FileManager.default.fileExists(atPath: armedURL().path)
    let disabled = SleepOverride.sleepDisabled()
    let battery = readBattery()
    let thermal = readThermal(packTempC: battery.packTempC)
    let batt = battery.percent.map { "\($0)%" } ?? "n/a"
    print("keepawake \(version)")
    print("running:     \(pid.map { "yes (pid \($0))" } ?? "no")")
    print("armed:       \(armed)")
    print("SleepDisabled: \(disabled.map { $0 ? "1" : "0" } ?? "unknown")")
    print("helper:      \(SleepOverride.helperInstalled() ? SleepOverride.helperPath : "not installed")")
    print("sudo -n:     \(SleepOverride.canToggleNonInteractive() ? "ok" : "unavailable")")
    print("battery:     \(batt) charging=\(battery.charging)")
    print(thermal.description)
}

private func restoreSleepOnly() {
    if SleepOverride.invoke("enable-sleep") {
        log("pmset disablesleep restored to 0")
    } else {
        fputs("could not restore sleep (need helper or sudo)\n", stderr)
        fputs("run:  sudo pmset -a disablesleep 0\n", stderr)
        exit(1)
    }
    disarmSession()
}

private func main() {
    let config = Config.parse(CommandLine.arguments)

    if config.statusOnly {
        printStatus()
        return
    }
    if config.stopOnly {
        _ = stopExisting()
        // If we couldn't signal a live process, still try to restore sleep.
        if runningPid() == nil {
            restoreSleepOnly()
        }
        return
    }
    if config.restoreOnly {
        restoreSleepOnly()
        return
    }

    let session = Session(config: config)
    do {
        try session.start()
    } catch {
        fputs("keepawake: \(error)\n", stderr)
        exit(1)
    }
}

main()

#else
fatalError("keepawake.swift is macOS-only (IOKit / pmset).")
#endif
