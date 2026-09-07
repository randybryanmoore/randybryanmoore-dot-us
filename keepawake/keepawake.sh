#!/usr/bin/env bash
# keepawake.sh — controller + caffeinate fallback for keepawake.swift
#
# Prefer the compiled Swift binary (IOKit IOPMAssertionCreateWithName). If
# Swift is unavailable, this script holds `caffeinate` assertions and runs the
# same battery / thermal / ping / failsafe loop.
set -euo pipefail

VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SWIFT_SRC="${SCRIPT_DIR}/keepawake.swift"
BIN="${SCRIPT_DIR}/keepawake"
HELPER_SRC="${SCRIPT_DIR}/helpers/keepawake-pmset"
HELPER_DST="/usr/local/libexec/keepawake-pmset"
SUDOERS_SRC="${SCRIPT_DIR}/helpers/keepawake"
LABEL="com.randybryanmoore.keepawake"
RECONCILE_LABEL="com.randybryanmoore.keepawake-reconcile"

BATTERY_FLOOR="${KEEPWAKE_BATTERY_FLOOR:-15}"
MAX_TEMP_C="${KEEPWAKE_MAX_TEMP:-80}"
PING_INTERVAL="${KEEPWAKE_INTERVAL:-30}"
THERMAL_PRESSURE_LIMIT="${KEEPWAKE_THERMAL_PRESSURE_LIMIT:-2}"
PING_HOSTS=("1.1.1.1" "8.8.8.8")

support_dir() {
  printf '%s\n' "${KEEPWAKE_SUPPORT_DIR:-${HOME}/Library/Application Support/keepawake}"
}

log_file() {
  printf '%s\n' "${KEEPWAKE_LOG:-${HOME}/Library/Logs/keepawake.log}"
}

pid_file() { printf '%s\n' "$(support_dir)/keepawake.pid"; }
armed_file() { printf '%s\n' "$(support_dir)/armed"; }
heartbeat_file() { printf '%s\n' "$(support_dir)/heartbeat"; }

is_macos() { [[ "$(uname -s)" == "Darwin" ]]; }
simulate() { [[ "${KEEPWAKE_SIMULATE:-0}" == "1" ]]; }
runtime_ok() { is_macos || simulate; }

sim_dir() { printf '%s\n' "$(support_dir)/sim"; }

sim_init() {
  mkdir -p "$(sim_dir)"
  [[ -f "$(sim_dir)/SleepDisabled" ]] || printf '0\n' >"$(sim_dir)/SleepDisabled"
  [[ -f "$(sim_dir)/ping" ]] || printf 'ok\n' >"$(sim_dir)/ping"
  [[ -f "$(sim_dir)/battery" ]] || cat >"$(sim_dir)/battery" <<'EOF'
Now drawing from 'Battery Power'
 -InternalBattery-0	80%; discharging; 3:00 remaining present: true
EOF
  [[ -f "$(sim_dir)/temp" ]] || printf '45.00\n' >"$(sim_dir)/temp"
  [[ -f "$(sim_dir)/pressure" ]] || printf '0\n' >"$(sim_dir)/pressure"
  [[ -f "$(sim_dir)/wifi" ]] || printf 'en0\n' >"$(sim_dir)/wifi"
  [[ -f "$(sim_dir)/ssid" ]] || printf 'TransitHotspot\n' >"$(sim_dir)/ssid"
}

ensure_dirs() {
  mkdir -p "$(support_dir)" "$(dirname "$(log_file)")"
}

log() {
  local line
  line="$(date -u +"%Y-%m-%dT%H:%M:%SZ")  $*"
  # When started via nohup, stdout is already the log file — don't duplicate.
  if [[ -t 1 ]]; then
    printf '%s\n' "$line"
  fi
  ensure_dirs
  printf '%s\n' "$line" >>"$(log_file)"
}

die() { printf 'keepawake: %s\n' "$*" >&2; exit 1; }

notify() {
  local subtitle="$1" body="$2"
  if is_macos && command -v osascript >/dev/null 2>&1; then
    osascript -e "display notification \"${body//\"/\\\"}\" with title \"keepawake\" subtitle \"${subtitle//\"/\\\"}\"" >/dev/null 2>&1 || true
  fi
}

# --- parsers (also used by selftest; keep host-agnostic) ---

keepawake_parse_battery_percent() {
  # Typical: "-InternalBattery-0 ... 37%; discharging; 2:34 remaining"
  printf '%s\n' "$1" | grep -oE '[0-9]+%' | head -1 | tr -d '%' || true
}

keepawake_battery_is_charging() {
  # Check discharging before charging — the former contains the latter.
  if printf '%s\n' "$1" | grep -qi 'AC Power'; then
    printf '1'
  elif printf '%s\n' "$1" | grep -qi 'discharging'; then
    printf '0'
  elif printf '%s\n' "$1" | grep -qi 'charging'; then
    printf '1'
  else
    printf '0'
  fi
}

keepawake_normalize_temp_c() {
  local v="$1"
  awk -v v="$v" 'BEGIN {
    if (v == "" || v+0 != v) { exit 1 }
    if (v+0 > 200) printf "%.2f", v/100.0
    else printf "%.2f", v+0
  }'
}

keepawake_should_failsafe_battery() {
  local pct="${1:-}" floor="${2:-15}" charging="${3:-0}"
  # Spec: sleep below the floor even if a charger is attached.
  _="$charging"
  [[ -n "$pct" && "$pct" =~ ^[0-9]+$ && "$pct" -le "$floor" ]] && printf '1' || printf '0'
}

keepawake_should_failsafe_temp() {
  local temp="${1:-}" limit="${2:-80}"
  awk -v t="$temp" -v lim="$limit" 'BEGIN {
    if (t == "" || t+0 != t) { print 0; exit }
    print (t+0 >= lim+0) ? 1 : 0
  }'
}

keepawake_should_failsafe_pressure() {
  local pressure="${1:-}" limit="${2:-2}"
  [[ -n "$pressure" && "$pressure" =~ ^[0-9]+$ && "$pressure" -ge "$limit" ]] && printf '1' || printf '0'
}

# --- live macOS sensors ---

battery_snapshot() {
  if simulate; then
    sim_init
    cat "$(sim_dir)/battery"
    return 0
  fi
  pmset -g batt 2>/dev/null || true
}

pack_temp_c() {
  if simulate; then
    sim_init
    cat "$(sim_dir)/temp"
    return 0
  fi
  local raw
  raw="$(ioreg -r -n AppleSmartBattery -l 2>/dev/null | awk -F'= ' '/"Temperature" =/{gsub(/[^0-9.]/,"",$2); print $2; exit}')"
  [[ -z "$raw" ]] && return 1
  keepawake_normalize_temp_c "$raw"
}

darwin_thermal_pressure() {
  if simulate; then
    sim_init
    tr -d '[:space:]' <"$(sim_dir)/pressure"
    return 0
  fi
  # notifyd state, no root. Python is optional; Swift is always on macOS.
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY' 2>/dev/null && return 0
import ctypes, sys
libc = ctypes.CDLL("/usr/lib/libSystem.B.dylib")
token = ctypes.c_int()
if libc.notify_register_check(b"com.apple.system.thermalpressurelevel", ctypes.byref(token)) != 0:
    sys.exit(1)
state = ctypes.c_uint64()
if libc.notify_get_state(token, ctypes.byref(state)) != 0:
    sys.exit(1)
print(int(state.value))
PY
  fi
  if command -v swift >/dev/null 2>&1; then
    swift - <<'SWIFT' 2>/dev/null || true
import Darwin
var token: Int32 = 0
guard notify_register_check("com.apple.system.thermalpressurelevel", &token) == 0 else { fatalError() }
var state: UInt64 = 0
guard notify_get_state(token, &state) == 0 else { fatalError() }
print(state)
SWIFT
  fi
}

wifi_device() {
  if simulate; then
    sim_init
    tr -d '[:space:]' <"$(sim_dir)/wifi"
    return 0
  fi
  networksetup -listallhardwareports 2>/dev/null | awk '
    /Wi-Fi|AirPort/ { hit=1; next }
    hit && /Device:/ { print $2; exit }
  '
}

current_ssid() {
  local dev="$1" line
  if simulate; then
    sim_init
    tr -d '[:space:]' <"$(sim_dir)/ssid"
    return 0
  fi
  line="$(networksetup -getairportnetwork "$dev" 2>/dev/null || true)"
  if printf '%s\n' "$line" | grep -qi 'not associated'; then
    return 1
  fi
  printf '%s\n' "$line" | sed 's/.*: //'
}

default_gateway() {
  if simulate; then
    printf '1.1.1.1\n'
    return 0
  fi
  route -n get default 2>/dev/null | awk '/gateway:/{print $2; exit}'
}

ping_host() {
  if simulate; then
    sim_init
    printf 'ping %s\n' "$1" >>"$(sim_dir)/ping.log"
    [[ "$(tr -d '[:space:]' <"$(sim_dir)/ping")" == "ok" ]]
    return
  fi
  ping -c 1 -t 2 "$1" >/dev/null 2>&1
}

ping_any() {
  local h
  for h in "${PING_HOSTS[@]}"; do
    ping_host "$h" && return 0
  done
  return 1
}

# --- privileged sleep toggle ---

helper_ok() {
  simulate && return 1
  [[ -x "$HELPER_DST" ]] && sudo -n "$HELPER_DST" status >/dev/null 2>&1
}

pmset_verb() {
  local verb="$1"
  if simulate; then
    sim_init
    case "$verb" in
      disable-sleep) printf '1\n' >"$(sim_dir)/SleepDisabled" ;;
      enable-sleep)  printf '0\n' >"$(sim_dir)/SleepDisabled" ;;
      sleep-now)
        printf '0\n' >"$(sim_dir)/SleepDisabled"
        printf '1\n' >"$(sim_dir)/sleepnow"
        ;;
      status) cat "$(sim_dir)/SleepDisabled" ;;
      *) return 2 ;;
    esac
    return 0
  fi
  if helper_ok; then
    sudo -n "$HELPER_DST" "$verb"
    return $?
  fi
  case "$verb" in
    disable-sleep) sudo -n /usr/bin/pmset -a disablesleep 1 ;;
    enable-sleep)  sudo -n /usr/bin/pmset -a disablesleep 0 ;;
    sleep-now)
      sudo -n /usr/bin/pmset -a disablesleep 0 2>/dev/null || true
      sudo -n /usr/bin/pmset sleepnow 2>/dev/null || /usr/bin/pmset sleepnow
      ;;
    status) /usr/bin/pmset -g ;;
    *) return 2 ;;
  esac
}

can_toggle_noninteractive() {
  simulate && return 0
  helper_ok && return 0
  sudo -n /usr/bin/pmset -g >/dev/null 2>&1
}

sleep_disabled() {
  if simulate; then
    sim_init
    tr -d '[:space:]' <"$(sim_dir)/SleepDisabled"
    return 0
  fi
  if ! command -v pmset >/dev/null 2>&1; then
    printf 'unknown\n'
    return 0
  fi
  local out
  out="$(pmset -g 2>/dev/null | awk 'tolower($0) ~ /sleepdisabled/ { print $NF; found=1 } END { if (!found) print 0 }' || true)"
  printf '%s\n' "${out:-unknown}"
}

# --- process control ---

running_pid() {
  local pf pid
  pf="$(pid_file)"
  [[ -f "$pf" ]] || return 1
  pid="$(tr -d '[:space:]' <"$pf")"
  [[ "$pid" =~ ^[0-9]+$ ]] || return 1
  kill -0 "$pid" 2>/dev/null || return 1
  printf '%s\n' "$pid"
}

write_pid() {
  ensure_dirs
  printf '%s\n' "$$" >"$(pid_file)"
}

clear_pid() { rm -f "$(pid_file)"; }

arm() {
  ensure_dirs
  printf '%s %s\n' "$$" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" >"$(armed_file)"
  date +%s >"$(heartbeat_file)"
}

disarm() {
  rm -f "$(armed_file)" "$(heartbeat_file)"
}

beat() { date +%s >"$(heartbeat_file)" 2>/dev/null || true; }

# --- daemon (caffeinate fallback) ---

CAFFEINATE_PID=""
WIFI_DEV=""
LAST_SSID=""
FAIL_COUNT=0
REASSOC_COUNT=0
LID_ARMED=0
HOLD_DISPLAY=0
LID_OVERRIDE=0

cleanup_daemon() {
  local sleep_now="${1:-0}"
  if [[ -n "$CAFFEINATE_PID" ]] && kill -0 "$CAFFEINATE_PID" 2>/dev/null; then
    kill "$CAFFEINATE_PID" 2>/dev/null || true
    wait "$CAFFEINATE_PID" 2>/dev/null || true
  fi
  if [[ "$LID_ARMED" == "1" ]]; then
    if pmset_verb enable-sleep >/dev/null 2>&1; then
      log "restored pmset disablesleep=0"
    else
      log "WARNING: could not restore disablesleep. Run: sudo pmset -a disablesleep 0"
      notify "Sleep not restored" "Run: sudo pmset -a disablesleep 0"
    fi
    LID_ARMED=0
  fi
  disarm
  clear_pid
  if [[ "$sleep_now" == "1" ]]; then
    pmset_verb sleep-now >/dev/null 2>&1 || pmset sleepnow >/dev/null 2>&1 || true
  fi
  log "keepawake stopped"
}

failsafe() {
  local reason="$1"
  log "FAILSAFE: $reason"
  notify "Failsafe sleep" "$reason"
  cleanup_daemon 1
  exit 0
}

network_tick() {
  if ping_any; then
    FAIL_COUNT=0
    REASSOC_COUNT=0
    if [[ -n "$WIFI_DEV" && -z "$LAST_SSID" ]]; then
      LAST_SSID="$(current_ssid "$WIFI_DEV" || true)"
    fi
    return 0
  fi
  FAIL_COUNT=$((FAIL_COUNT + 1))
  local gw gw_ok="0"
  gw="$(default_gateway || true)"
  if [[ -n "$gw" ]] && ping_host "$gw"; then gw_ok="1"; fi
  log "network: public ping failed ($FAIL_COUNT); gateway ${gw:-n/a} alive=$gw_ok"
  [[ "$FAIL_COUNT" -lt 2 ]] && return 0

  notify "Network dropped" "Public ping failed. Attempting Wi-Fi reassociate."
  if [[ -z "$WIFI_DEV" ]]; then
    log "network: no Wi-Fi device; cannot reassociate"
    return 0
  fi

  local ssid="${LAST_SSID:-}"
  ssid="${ssid:-$(current_ssid "$WIFI_DEV" || true)}"
  if [[ -n "$ssid" ]]; then
    LAST_SSID="$ssid"
    log "network: reassociating to $ssid on $WIFI_DEV"
    if simulate; then
      printf '%s reassociate %s %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$WIFI_DEV" "$ssid" >>"$(sim_dir)/reassociate.log"
    else
      networksetup -setairportnetwork "$WIFI_DEV" "$ssid" >/dev/null 2>&1 || true
    fi
    REASSOC_COUNT=$((REASSOC_COUNT + 1))
    sleep 3
    if ping_any; then
      log "network: reassociate succeeded"
      FAIL_COUNT=0
      return 0
    fi
  fi

  if [[ "$REASSOC_COUNT" -ge 3 ]]; then
    log "network: power-cycling Wi-Fi on $WIFI_DEV (last resort)"
    notify "Wi-Fi power-cycle" "Still offline after reassociate. Cycling $WIFI_DEV."
    if simulate; then
      printf '%s power-cycle %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$WIFI_DEV" >>"$(sim_dir)/reassociate.log"
    else
      networksetup -setairportpower "$WIFI_DEV" off >/dev/null 2>&1 || true
      sleep 2
      networksetup -setairportpower "$WIFI_DEV" on >/dev/null 2>&1 || true
    fi
    REASSOC_COUNT=0
    FAIL_COUNT=0
  fi
}

status_tick() {
  beat
  local snap pct charging pack pressure
  snap="$(battery_snapshot)"
  pct="$(keepawake_parse_battery_percent "$snap" || true)"
  charging="$(keepawake_battery_is_charging "$snap")"
  pack="$(pack_temp_c || true)"
  pressure="$(darwin_thermal_pressure || true)"
  log "status battery=${pct:-n/a}% charging=$charging pack=${pack:-n/a}°C pressure=${pressure:-n/a}"

  if [[ "$(keepawake_should_failsafe_battery "${pct:-}" "$BATTERY_FLOOR" "$charging")" == "1" ]]; then
    failsafe "battery ${pct}% below floor"
  fi
  if [[ -n "$pack" && "$(keepawake_should_failsafe_temp "$pack" "$MAX_TEMP_C")" == "1" ]]; then
    failsafe "internal temperature ${pack}°C exceeded limit"
  fi
  if [[ "$(keepawake_should_failsafe_pressure "${pressure:-}" "$THERMAL_PRESSURE_LIMIT")" == "1" ]]; then
    failsafe "thermal pressure ${pressure} (heavy/trapping/sleeping)"
  fi
  network_tick
}

run_shell_daemon() {
  runtime_ok || die "the caffeinate daemon is macOS-only (KEEPWAKE_SIMULATE=1 for e2e)"
  simulate && sim_init

  if pid="$(running_pid)"; then
    die "already running (pid $pid); stop it first"
  fi

  cmd_reconcile || true

  if [[ "$LID_OVERRIDE" == "1" ]]; then
    can_toggle_noninteractive || die "--lid-override / --bag needs the privileged helper or sudo -n. See README."
    pmset_verb disable-sleep
    LID_ARMED=1
    log "lid-override ON (pmset disablesleep=1). Persistent until restored."
  else
    log "lid-override OFF. caffeinate will NOT keep the Mac awake after lid close without a monitor."
  fi

  local caff_flags=(-i -s -m)
  if [[ "$HOLD_DISPLAY" == "1" ]]; then
    caff_flags+=(-d)
  fi
  if simulate; then
    sleep 3600 &
    CAFFEINATE_PID=$!
    printf '%s\n' "${caff_flags[*]}" >"$(sim_dir)/assertions"
    log "simulate assertions pid=$CAFFEINATE_PID flags=${caff_flags[*]}"
  else
    caffeinate "${caff_flags[@]}" &
    CAFFEINATE_PID=$!
    log "caffeinate pid=$CAFFEINATE_PID flags=${caff_flags[*]}"
  fi

  trap 'cleanup_daemon 0; exit 0' INT TERM HUP
  write_pid
  arm

  WIFI_DEV="$(wifi_device || true)"
  LAST_SSID=""
  if [[ -n "$WIFI_DEV" ]]; then
    LAST_SSID="$(current_ssid "$WIFI_DEV" || true)"
  fi
  log "keepawake $VERSION shell-daemon pid=$$ batteryFloor=${BATTERY_FLOOR}% maxTemp=${MAX_TEMP_C}°C interval=${PING_INTERVAL}s wifi=${WIFI_DEV:-n/a} ssid=${LAST_SSID:-n/a}"
  notify "Armed" "Failsafes: battery ${BATTERY_FLOOR}%, ${MAX_TEMP_C}°C."

  status_tick
  while true; do
    sleep "$PING_INTERVAL"
    status_tick
  done
}

# --- Swift vs shell dispatch ---

swift_available() {
  [[ -x "$BIN" ]] && return 0
  command -v swift >/dev/null 2>&1 && [[ -f "$SWIFT_SRC" ]]
}

run_swift() {
  local extra=("$@")
  if [[ -x "$BIN" ]]; then
    exec "$BIN" "${extra[@]}"
  fi
  exec /usr/bin/swift "$SWIFT_SRC" "${extra[@]}"
}

parse_run_flags() {
  HOLD_DISPLAY=1
  LID_OVERRIDE=0
  local arg
  for arg in "$@"; do
    case "$arg" in
      --bag) LID_OVERRIDE=1; HOLD_DISPLAY=0 ;;
      --lid-override) LID_OVERRIDE=1 ;;
      --no-lid-override) LID_OVERRIDE=0 ;;
      --no-display-assertion) HOLD_DISPLAY=0 ;;
      --display-assertion) HOLD_DISPLAY=1 ;;
      --battery-floor) ;;
      --max-temp|--interval) ;;
    esac
  done
  # value flags
  local i=1
  local args=("dummy" "$@")
  while [[ $i -lt ${#args[@]} ]]; do
    case "${args[$i]}" in
      --battery-floor) i=$((i+1)); BATTERY_FLOOR="${args[$i]}" ;;
      --max-temp) i=$((i+1)); MAX_TEMP_C="${args[$i]}" ;;
      --interval) i=$((i+1)); PING_INTERVAL="${args[$i]}" ;;
    esac
    i=$((i+1))
  done
}

cmd_run() {
  parse_run_flags "$@"
  if is_macos && swift_available && ! simulate; then
    local swift_args=()
    [[ "$LID_OVERRIDE" == "1" ]] && swift_args+=(--lid-override)
    [[ "$HOLD_DISPLAY" == "0" ]] && swift_args+=(--no-display-assertion)
    swift_args+=(--battery-floor "$BATTERY_FLOOR" --max-temp "$MAX_TEMP_C" --interval "$PING_INTERVAL")
    # pass through remaining known flags already encoded
    local a
    for a in "$@"; do
      case "$a" in
        --bag) swift_args+=(--bag) ;;
      esac
    done
    run_swift "${swift_args[@]}"
  fi
  run_shell_daemon
}

cmd_start() {
  runtime_ok || die "start is macOS-only (KEEPWAKE_SIMULATE=1 for e2e)"
  simulate && sim_init
  if pid="$(running_pid)"; then
    die "already running (pid $pid)"
  fi
  ensure_dirs
  nohup "$0" run --bag "$@" >>"$(log_file)" 2>&1 &
  disown || true
  sleep 1
  if pid="$(running_pid)"; then
    log "started pid $pid (bag profile)"
    printf 'keepawake started (pid %s). log: %s\n' "$pid" "$(log_file)"
  else
    log "failed to start; last log lines:"
    if [[ -f "$(log_file)" ]]; then
      tail -n 20 "$(log_file)" >&2 || true
    fi
    die "failed to start; check $(log_file)"
  fi
}

cmd_stop() {
  local pid=""
  pid="$(running_pid || true)"
  if [[ -n "$pid" ]]; then
    log "sending SIGTERM to pid $pid"
    kill -TERM "$pid" 2>/dev/null || true
    local i
    for i in $(seq 1 20); do
      kill -0 "$pid" 2>/dev/null || break
      sleep 0.25
    done
    if kill -0 "$pid" 2>/dev/null; then
      log "pid $pid still alive; SIGKILL"
      kill -KILL "$pid" 2>/dev/null || true
    fi
  else
    log "no running keepawake process"
  fi
  # Restore sleep even if the process died without cleaning up.
  cmd_restore
}

cmd_restore() {
  local rc=0
  if can_toggle_noninteractive; then
    pmset_verb enable-sleep
    log "pmset disablesleep restored to 0"
  elif is_macos && [[ "$(sleep_disabled)" == "1" ]]; then
    printf 'SleepDisabled is still 1 and sudo -n is unavailable.\n' >&2
    printf 'Run:  sudo pmset -a disablesleep 0\n' >&2
    rc=1
  fi
  disarm
  clear_pid
  return "$rc"
}

cmd_reconcile() {
  ensure_dirs
  if [[ ! -f "$(armed_file)" ]]; then
    return 0
  fi
  if pid="$(running_pid)"; then
    log "reconcile: live pid $pid, leaving armed flag"
    return 0
  fi
  log "reconcile: leftover armed flag with no live process; restoring sleep"
  cmd_restore || true
  notify "Recovered" "Previous session died still armed. Sleep restored."
}

cmd_status() {
  if is_macos && swift_available && ! simulate; then
    run_swift --status || true
    return 0
  fi
  local pid disabled helper
  pid="$(running_pid || true)"
  disabled="$(sleep_disabled)"
  helper="not installed"
  [[ -x "$HELPER_DST" ]] && helper="$HELPER_DST"
  printf 'keepawake %s\n' "$VERSION"
  if [[ -n "$pid" ]]; then
    printf 'running:     yes (pid %s)\n' "$pid"
  else
    printf 'running:     no\n'
  fi
  printf 'armed:       %s\n' "$( [[ -f "$(armed_file)" ]] && echo yes || echo no )"
  printf 'SleepDisabled: %s\n' "$disabled"
  printf 'helper:      %s\n' "$helper"
}

cmd_build() {
  is_macos || die "swiftc/IOKit build is macOS-only"
  command -v swiftc >/dev/null 2>&1 || die "swiftc not found. Install Xcode CLT: xcode-select --install"
  swiftc -O -framework IOKit -o "$BIN" "$SWIFT_SRC"
  chmod +x "$BIN"
  printf 'built %s\n' "$BIN"
}

cmd_install_helper() {
  is_macos || die "helper install is macOS-only"
  local user
  user="$(whoami)"
  printf 'Installing privileged helper (admin password required once).\n'
  sudo mkdir -p /usr/local/libexec
  sudo install -m 755 -o root -g wheel "$HELPER_SRC" "$HELPER_DST"
  local tmp
  tmp="$(mktemp)"
  sed "s/YOUR_MAC_USERNAME/${user}/g" "$SUDOERS_SRC" >"$tmp"
  sudo visudo -c -f "$tmp"
  sudo install -m 440 -o root -g wheel "$tmp" /etc/sudoers.d/keepawake
  rm -f "$tmp"
  sudo -n "$HELPER_DST" status >/dev/null
  printf 'helper ok: %s (sudoers user=%s)\n' "$HELPER_DST" "$user"
}

cmd_install_agent() {
  is_macos || die "LaunchAgent install is macOS-only"
  local home dest rdest
  home="$HOME"
  dest="${home}/Library/LaunchAgents/${LABEL}.plist"
  rdest="${home}/Library/LaunchAgents/${RECONCILE_LABEL}.plist"
  mkdir -p "${home}/Library/LaunchAgents"
  sed -e "s|__KEEPWAKE_SH__|${SCRIPT_DIR}/keepawake.sh|g" \
      -e "s|__KEEPWAKE_DIR__|${SCRIPT_DIR}|g" \
      -e "s|__HOME__|${home}|g" \
      "${SCRIPT_DIR}/helpers/${LABEL}.plist.template" >"$dest"
  sed -e "s|__KEEPWAKE_SH__|${SCRIPT_DIR}/keepawake.sh|g" \
      -e "s|__KEEPWAKE_DIR__|${SCRIPT_DIR}|g" \
      -e "s|__HOME__|${home}|g" \
      "${SCRIPT_DIR}/helpers/${RECONCILE_LABEL}.plist.template" >"$rdest"
  chmod +x "${SCRIPT_DIR}/keepawake.sh"
  launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
  launchctl bootout "gui/$(id -u)/${RECONCILE_LABEL}" 2>/dev/null || true
  launchctl bootstrap "gui/$(id -u)" "$dest"
  launchctl bootstrap "gui/$(id -u)" "$rdest"
  launchctl enable "gui/$(id -u)/${LABEL}"
  launchctl enable "gui/$(id -u)/${RECONCILE_LABEL}"
  printf 'installed LaunchAgents:\n  %s (manual start)\n  %s (login reconcile)\n' "$dest" "$rdest"
  printf 'start with:  launchctl kickstart gui/%s/%s\n' "$(id -u)" "$LABEL"
  printf '         or: %s start\n' "$0"
}

cmd_uninstall_agent() {
  is_macos || die "LaunchAgent uninstall is macOS-only"
  launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
  launchctl bootout "gui/$(id -u)/${RECONCILE_LABEL}" 2>/dev/null || true
  rm -f "${HOME}/Library/LaunchAgents/${LABEL}.plist" \
        "${HOME}/Library/LaunchAgents/${RECONCILE_LABEL}.plist"
  printf 'LaunchAgents removed.\n'
}

cmd_selftest() {
  local fails=0
  check() {
    local name="$1" got="$2" want="$3"
    if [[ "$got" == "$want" ]]; then
      printf 'ok  %s\n' "$name"
    else
      printf 'FAIL %s: got %q want %q\n' "$name" "$got" "$want"
      fails=$((fails + 1))
    fi
  }

  local sample
  sample=$'Now drawing from \'Battery Power\'\n -InternalBattery-0 (id-1234)\t37%; discharging; 2:34 remaining present: true'
  check parse-percent "$(keepawake_parse_battery_percent "$sample")" "37"
  check parse-charging "$(keepawake_battery_is_charging "$sample")" "0"

  sample=$'Now drawing from \'AC Power\'\n -InternalBattery-0\t12%; charging; 0:00 remaining present: true'
  check parse-charging-ac "$(keepawake_battery_is_charging "$sample")" "1"
  check failsafe-charging "$(keepawake_should_failsafe_battery 12 15 1)" "1"
  check failsafe-12 "$(keepawake_should_failsafe_battery 12 15 0)" "1"
  check failsafe-15 "$(keepawake_should_failsafe_battery 15 15 0)" "1"
  check failsafe-16 "$(keepawake_should_failsafe_battery 16 15 0)" "0"

  check temp-centi "$(keepawake_normalize_temp_c 3015)" "30.15"
  check temp-c "$(keepawake_normalize_temp_c 81)" "81.00"
  check failsafe-temp-hot "$(keepawake_should_failsafe_temp 80 80)" "1"
  check failsafe-temp-ok "$(keepawake_should_failsafe_temp 79.9 80)" "0"
  check failsafe-pressure-heavy "$(keepawake_should_failsafe_pressure 2 2)" "1"
  check failsafe-pressure-mod "$(keepawake_should_failsafe_pressure 1 2)" "0"

  # helper refuses unknown verbs (as non-root we only syntax-check the case)
  if grep -q 'disable-sleep)' "$HELPER_SRC" \
     && grep -q 'enable-sleep)' "$HELPER_SRC" \
     && grep -q 'sleep-now)' "$HELPER_SRC" \
     && grep -q 'status)' "$HELPER_SRC"; then
    check helper-verbs-present "0" "0"
  else
    check helper-verbs-present "1" "0"
  fi

  sample=$'Now drawing from \'Battery Power\'\n -InternalBattery-0\t8%; discharging; 0:12 remaining present: true'
  check discharging-not-charging "$(keepawake_battery_is_charging "$sample")" "0"
  check failsafe-8pct "$(keepawake_should_failsafe_battery 8 15 0)" "1"

  if grep -q 'IOPMAssertionCreateWithName' "$SWIFT_SRC" \
     && grep -q 'kIOPMAssertionTypePreventSystemSleep' "$SWIFT_SRC"; then
    check swift-iokit-assertions "0" "0"
  else
    check swift-iokit-assertions "1" "0"
  fi

  if cmd_e2e; then
    check e2e-start-to-stop "0" "0"
  else
    check e2e-start-to-stop "1" "0"
  fi

  if [[ $fails -eq 0 ]]; then
    printf 'selftest: all checks passed\n'
    return 0
  fi
  printf 'selftest: %s check(s) failed\n' "$fails"
  return 1
}

cmd_e2e() {
  local root
  root="$(mktemp -d "${TMPDIR:-/tmp}/keepawake-e2e.XXXXXX")"
  # Isolate simulate state so a Mac running selftest cannot touch real pmset.
  (
    set -euo pipefail
    export KEEPWAKE_SIMULATE=1
    export KEEPWAKE_SUPPORT_DIR="$root/support"
    export KEEPWAKE_LOG="$root/keepawake.log"
    export KEEPWAKE_INTERVAL=1
    export KEEPWAKE_BATTERY_FLOOR=15
    export KEEPWAKE_MAX_TEMP=80
    mkdir -p "$KEEPWAKE_SUPPORT_DIR/sim"
    sim="$KEEPWAKE_SUPPORT_DIR/sim"
    fail=0
    eok() {
      local name="$1"
      shift
      if "$@"; then
        printf 'ok  e2e-%s\n' "$name"
      else
        printf 'FAIL e2e-%s\n' "$name"
        fail=$((fail + 1))
      fi
    }

    write_batt() {
      local pct="$1" extra="${2:-discharging}"
      cat >"$sim/battery" <<EOF
Now drawing from 'Battery Power'
 -InternalBattery-0	${pct}%; ${extra}; 1:00 remaining present: true
EOF
    }

    printf '0\n' >"$sim/SleepDisabled"
    write_batt 82
    printf '42.00\n' >"$sim/temp"
    printf '0\n' >"$sim/pressure"
    printf 'ok\n' >"$sim/ping"
    printf 'en0\n' >"$sim/wifi"
    printf 'TransitHotspot\n' >"$sim/ssid"

    "$0" start
    st="$("$0" status)"
    printf '%s\n' "$st"
    eok start-running grep -q 'running:     yes' <<<"$st"
    eok start-armed grep -q 'armed:       yes' <<<"$st"
    eok start-lid-override grep -q 'SleepDisabled: 1' <<<"$st"
    eok bag-no-display grep -qv -- '-d' "$sim/assertions"
    eok bag-idle-assert grep -q -- '-i' "$sim/assertions"
    eok bag-system-assert grep -q -- '-s' "$sim/assertions"
    eok ping-keepalive grep -q 'ping 1.1.1.1' "$sim/ping.log"

    "$0" stop
    st="$("$0" status)"
    eok stop-not-running grep -q 'running:     no' <<<"$st"
    eok stop-disarmed grep -q 'armed:       no' <<<"$st"
    eok stop-sleep-restored grep -q 'SleepDisabled: 0' <<<"$st"

    # Battery failsafe (spec: ≤15% trips even while charging).
    : >"$KEEPWAKE_LOG"
    rm -f "$sim/sleepnow" "$sim/ping.log"
    printf '0\n' >"$sim/SleepDisabled"
    write_batt 12 charging
    printf '42.00\n' >"$sim/temp"
    printf 'ok\n' >"$sim/ping"
    "$0" run --bag &
    rp=$!
    for i in $(seq 1 20); do
      kill -0 "$rp" 2>/dev/null || break
      sleep 0.2
    done
    wait "$rp" 2>/dev/null || true
    eok battery-failsafe grep -q 'FAILSAFE: battery 12% below floor' "$KEEPWAKE_LOG"
    eok battery-sleepnow test -f "$sim/sleepnow"
    eok battery-restored test "$(tr -d '[:space:]' <"$sim/SleepDisabled")" = "0"
    eok battery-not-running grep -q 'running:     no' <<<"$("$0" status)"

    # Thermal failsafe at 80°C.
    : >"$KEEPWAKE_LOG"
    rm -f "$sim/sleepnow"
    printf '0\n' >"$sim/SleepDisabled"
    write_batt 80
    printf '80.00\n' >"$sim/temp"
    "$0" run --bag &
    rp=$!
    for i in $(seq 1 20); do
      kill -0 "$rp" 2>/dev/null || break
      sleep 0.2
    done
    wait "$rp" 2>/dev/null || true
    eok temp-failsafe grep -q 'FAILSAFE: internal temperature 80.00°C exceeded limit' "$KEEPWAKE_LOG"
    eok temp-sleepnow test -f "$sim/sleepnow"

    # Thermal pressure heavy.
    : >"$KEEPWAKE_LOG"
    rm -f "$sim/sleepnow"
    printf '0\n' >"$sim/SleepDisabled"
    write_batt 80
    printf '42.00\n' >"$sim/temp"
    printf '2\n' >"$sim/pressure"
    "$0" run --bag &
    rp=$!
    for i in $(seq 1 20); do
      kill -0 "$rp" 2>/dev/null || break
      sleep 0.2
    done
    wait "$rp" 2>/dev/null || true
    eok pressure-failsafe grep -q 'FAILSAFE: thermal pressure 2' "$KEEPWAKE_LOG"

    # Network drop → reassociate (no power-cycle on first recovery attempt).
    : >"$KEEPWAKE_LOG"
    rm -f "$sim/reassociate.log" "$sim/ping.log" "$sim/sleepnow"
    printf '0\n' >"$sim/SleepDisabled"
    write_batt 80
    printf '42.00\n' >"$sim/temp"
    printf '0\n' >"$sim/pressure"
    printf 'fail\n' >"$sim/ping"
    "$0" start
    sleep 2.5
    eok net-notify grep -q 'network: public ping failed' "$KEEPWAKE_LOG"
    eok net-reassociate test -s "$sim/reassociate.log"
    eok net-reassociate-ssid grep -q 'TransitHotspot' "$sim/reassociate.log"
    "$0" stop

    # Helper refuses to run as non-root (do not weaken this check).
    set +e
    "$HELPER_SRC" status >/dev/null 2>&1
    hr=$?
    set -e
    eok helper-requires-root test "$hr" -eq 1

    if [[ "$fail" -ne 0 ]]; then
      printf 'e2e: %s check(s) failed. log:\n' "$fail" >&2
      tail -n 40 "$KEEPWAKE_LOG" >&2 || true
      exit 1
    fi
    printf 'e2e: start/stop, failsafes, and network path passed\n'
  )
  local rc=$?
  rm -rf "$root"
  return "$rc"
}

usage() {
  cat <<EOF
keepawake.sh ${VERSION} — macOS closed-lid / transit keep-alive

Usage:
  ./keepawake.sh build                 Compile keepawake.swift (IOKit)
  ./keepawake.sh install-helper        Install root helper + sudoers.d drop-in
  ./keepawake.sh install-agent         Install LaunchAgents (manual + reconcile)
  ./keepawake.sh start                 Background bag profile (lid-override)
  ./keepawake.sh stop                  SIGTERM + restore default sleep
  ./keepawake.sh status
  ./keepawake.sh restore               sudo pmset disablesleep 0
  ./keepawake.sh uninstall-agent
  ./keepawake.sh selftest
  ./keepawake.sh run [--bag]           Foreground daemon

See README.md for permissions, lid-close behavior, and exact Terminal steps.
EOF
}

main() {
  local cmd="${1:-}"
  shift || true
  case "$cmd" in
    build) cmd_build ;;
    install-helper) cmd_install_helper ;;
    install-agent) cmd_install_agent ;;
    uninstall-agent) cmd_uninstall_agent ;;
    start) cmd_start "$@" ;;
    stop) cmd_stop ;;
    status) cmd_status ;;
    restore|restore-sleep) cmd_restore ;;
    reconcile) cmd_reconcile ;;
    run) cmd_run "$@" ;;
    selftest) cmd_selftest ;;
    -h|--help|help|"") usage ;;
    --version) printf 'keepawake %s\n' "$VERSION" ;;
    *) die "unknown command: $cmd (try --help)" ;;
  esac
}

main "$@"
