# keepawake

Lightweight macOS utility to keep a personal MacBook reachable for headless remote access while the lid is closed (for example in a transit bag), with battery and thermal failsafes.

Two implementations ship together:

| File | Role |
|------|------|
| `keepawake.swift` | Preferred daemon. Talks to IOKit via `IOPMAssertionCreateWithName`. |
| `keepawake.sh` | Controller, LaunchAgent installer, and `caffeinate` fallback if Swift is not compiled. |

`./keepawake.sh` is the command you actually run.

## What actually prevents sleep

There are two different sleep paths on a MacBook.

**Idle / display-idle sleep** — blocked by IOKit power assertions (what `caffeinate`, Amphetamine, and this tool hold):

- `kIOPMAssertionTypePreventUserIdleSystemSleep`
- `kIOPMAssertionTypePreventSystemSleep`
- `kIOPMAssertionTypePreventUserIdleDisplaySleep` (optional; **off** in `--bag` so the panel stays dark and dumps less heat)

Those assertions do **not** survive closing the lid with no external monitor attached. Apple's clamshell sleep is a lower-level path.

**Lid-close sleep with no external display** — the public lever is:

```bash
sudo pmset -a disablesleep 1   # prevent sleep, including lid close
sudo pmset -a disablesleep 0   # restore default behavior
pmset -g | grep SleepDisabled  # 1 = sleep globally disabled
```

That setting is persistent (survives quitting Terminal, dropping SSH, and process crashes) until something sets it back to `0` or the Mac reboots. keepawake therefore:

1. Flips it on only when you pass `--bag` / `--lid-override`.
2. Restores it on `stop`, SIGTERM, and failsafe sleep.
3. Writes an `armed` flag so a login LaunchAgent can restore sleep if the process died still holding the flag.

Apple's supported alternative is real clamshell mode: **AC power + external display** (and typically a keyboard/mouse). If you have those, you do not need `--lid-override`.

## Permissions (read this once)

| Need | What | Why |
|------|------|-----|
| None | IOKit assertions, `caffeinate`, ping, battery %, thermal pressure | Unprivileged. |
| Admin, once | `keepawake.sh install-helper` | Installs root-owned `/usr/local/libexec/keepawake-pmset` plus `/etc/sudoers.d/keepawake`. |
| Passwordless `sudo -n` on **that helper only** | Failsafe inside a bag | At 15% battery or 80 °C there is no TTY for a password prompt. `pmset sleepnow` is a no-op while `SleepDisabled=1`, so the helper must be able to set `disablesleep 0` then sleep. |
| Not required | Full Disk Access, Accessibility, kernel extensions, SIP off | Do not disable SIP. |

The helper accepts four verbs and nothing else: `disable-sleep`, `enable-sleep`, `sleep-now`, `status`. It must stay `root:wheel` and not user-writable, or passwordless sudo becomes a privilege-escalation hole.

`--bag` **refuses to start** if it cannot toggle `disablesleep` non-interactively. Install the helper first.

No extra TCC prompt is needed for ICMP ping. Local Network permission is unused.

## Safety failsafes

| Watch | Trip | Action |
|-------|------|--------|
| Internal battery | ≤ 15% (even if charging) | Release assertions, `disablesleep 0`, `pmset sleepnow` |
| Internal temperature | ≥ 80 °C / 176 °F (HID die/cluster if available, else battery-pack sensor) | Same |
| Thermal pressure (`com.apple.system.thermalpressurelevel`) | ≥ 2 (`heavy` / `trapping` / `sleeping`) | Same |
| `ProcessInfo.thermalState` | `.serious` or `.critical` | Same |

Thermal pressure is the unprivileged Darwin notify that `powermetrics` uses. On Apple Silicon, exact die °C is optional (IOHID, no root). If HID is unavailable, pressure ≥ heavy is treated as over the safe operating limit for a closed bag — that typically trips *before* the SoC is in a dangerous range.

Software cannot change physics. A closed lid in a bag still traps heat. These failsafes exist because of that, not instead of it. Prefer a short transit hop, not an hours-long compile in a backpack.

## Network keep-alive

Every 30 seconds the daemon pings `1.1.1.1`, then `8.8.8.8` if needed, so the Wi-Fi / Personal Hotspot radio does not idle into a dormant state.

On consecutive public-ping failures it:

1. Notifies (`osascript` notification).
2. Reassociates to the SSID captured at start (`networksetup -setairportnetwork`) using the Keychain password — **never** passed on the command line.
3. After three failed reassociates, power-cycles the Wi-Fi device as a last resort (this will drop an in-flight SSH session on that interface).

Gateway-only reachability (hotspot up, internet down) does not bounce Wi-Fi.

## Verify (no Mac required for this gate)

```bash
cd keepawake
./keepawake.sh selftest
```

That runs parser checks plus a simulated start → ping → failsafe → stop loop (`KEEPWAKE_SIMULATE=1`). It does not toggle real `pmset` on a Mac. After helper install, use `./keepawake.sh start` on the MacBook itself to prove lid-close.

## Setup (exact commands)

On the MacBook, in Terminal:

```bash
cd /path/to/randybryanmoore-dot-us/keepawake
chmod +x keepawake.sh keepawake.swift helpers/keepawake-pmset
```

### 1. Optional: compile the IOKit daemon

```bash
xcode-select -p >/dev/null || xcode-select --install
./keepawake.sh build
```

That runs:

```bash
swiftc -O -framework IOKit -o ./keepawake keepawake.swift
```

If you skip this, `keepawake.sh start` still works: it runs `swift keepawake.swift` when the compiler/runtime is present, otherwise a `caffeinate -ism` fallback with the same monitor loop.

### 2. Required for closed-lid / bag use: privileged helper

```bash
./keepawake.sh install-helper
```

That is equivalent to:

```bash
sudo mkdir -p /usr/local/libexec
sudo install -m 755 -o root -g wheel helpers/keepawake-pmset /usr/local/libexec/keepawake-pmset
sed "s/YOUR_MAC_USERNAME/$(whoami)/g" helpers/keepawake > /tmp/keepawake.sudoers
sudo visudo -c -f /tmp/keepawake.sudoers
sudo install -m 440 -o root -g wheel /tmp/keepawake.sudoers /etc/sudoers.d/keepawake
sudo -n /usr/local/libexec/keepawake-pmset status
```

Confirm:

```bash
sudo -n /usr/local/libexec/keepawake-pmset status
pmset -g | grep SleepDisabled
```

### 3. Optional: LaunchAgents

```bash
./keepawake.sh install-agent
```

Installs:

- `~/Library/LaunchAgents/com.randybryanmoore.keepawake.plist` — **does not** start at login (`RunAtLoad=false`, `KeepAlive=false`). You start it when you pack the bag.
- `~/Library/LaunchAgents/com.randybryanmoore.keepawake-reconcile.plist` — runs at login and restores sleep if a previous session died still armed.

### 4. Enable remote access *before* you close the lid

Turn on at least one of: Screen Sharing, SSH (`Remote Login`), Tailscale, or your usual tunnel. Join the hotspot or Wi-Fi you will use in transit. Then:

```bash
./keepawake.sh start
./keepawake.sh status
pmset -g assertions | head
```

`start` uses the **bag profile**: lid-override on, display assertion off, 15% battery floor, 80 °C / thermal-pressure failsafe, 30 s ping.

Foreground (logs to the terminal):

```bash
./keepawake.sh run --bag
```

Or the Swift binary directly:

```bash
./keepawake --bag
# or
swift keepawake.swift --bag
```

Then close the lid. Confirm from your phone or another machine that SSH / Screen Sharing still answers.

Logs:

```bash
tail -f ~/Library/Logs/keepawake.log
```

## Stop and restore default sleep

Clean stop (releases IOKit/`caffeinate` assertions **and** sets `disablesleep 0`):

```bash
./keepawake.sh stop
```

If the process is already dead but sleep is still disabled:

```bash
./keepawake.sh restore
# or, always works:
sudo pmset -a disablesleep 0
```

Verify:

```bash
./keepawake.sh status
pmset -g | grep SleepDisabled    # expect 0 or the line absent
pmset -g assertions | grep -i keepawake || echo "no keepawake assertions"
```

LaunchAgent stop (if you started it that way):

```bash
launchctl kickstart -k "gui/$(id -u)/com.randybryanmoore.keepawake"
# Prefer:
./keepawake.sh stop
```

Remove the agents:

```bash
./keepawake.sh uninstall-agent
```

Remove the helper (returns sleep control to interactive sudo only):

```bash
sudo rm -f /usr/local/libexec/keepawake-pmset /etc/sudoers.d/keepawake
sudo visudo -c
sudo pmset -a disablesleep 0
```

IOKit assertions vanish when the process exits. `disablesleep` does **not** — always restore it.

## Flags

| Flag | Meaning |
|------|---------|
| `--bag` | Lid override on, display assertion off, failsafes on |
| `--lid-override` | `pmset disablesleep 1` via the helper |
| `--no-display-assertion` | Do not hold `PreventUserIdleDisplaySleep` |
| `--battery-floor 15` | Failsafe percent |
| `--max-temp 80` | Failsafe °C |
| `--interval 30` | Ping / sensor period in seconds |
| `--status` / `--stop` / `--restore-sleep` | Swift-binary equivalents of the shell commands |

## Uninstall checklist

1. `./keepawake.sh stop`
2. `./keepawake.sh uninstall-agent`
3. `sudo rm -f /usr/local/libexec/keepawake-pmset /etc/sudoers.d/keepawake`
4. `sudo pmset -a disablesleep 0`
5. `rm -rf ~/Library/Application\ Support/keepawake`

## Self-test (no Mac required for parsers)

```bash
./keepawake.sh selftest
```
