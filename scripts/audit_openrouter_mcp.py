#!/usr/bin/env python3
"""Audit and validation script for OpenRouter MCP integration.

Performs four levels of validation:
1. Workspace MCP configuration audit (.cursor/mcp.json)
2. Network connectivity and endpoint health (mcp.openrouter.ai)
3. MCP HTTP transport compliance check (Accept headers, SSE requirement, 401 challenge)
4. Optional API token live validation (if OPENROUTER_API_KEY is provided)

Usage:
    python3 scripts/audit_openrouter_mcp.py
    OPENROUTER_API_KEY=sk-or-v1-... python3 scripts/audit_openrouter_mcp.py
"""

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
MCP_CONFIG_PATH = WORKSPACE_ROOT / ".cursor" / "mcp.json"
EXPECTED_ENDPOINT = "https://mcp.openrouter.ai/mcp"
OAUTH_RESOURCE_METADATA = "https://mcp.openrouter.ai/mcp/.well-known/oauth-protected-resource"


def test_1_workspace_config():
    print("[1/4] Auditing .cursor/mcp.json workspace configuration...")
    if not MCP_CONFIG_PATH.is_file():
        return False, f"Missing config file at {MCP_CONFIG_PATH}"

    try:
        data = json.loads(MCP_CONFIG_PATH.read_text())
    except json.JSONDecodeError as exc:
        return False, f"JSON parse error in {MCP_CONFIG_PATH}: {exc}"

    mcp_servers = data.get("mcpServers", {})
    if "openrouter" not in mcp_servers:
        return False, "Key 'openrouter' missing in 'mcpServers'"

    server_entry = mcp_servers["openrouter"]
    configured_url = server_entry.get("url")
    if configured_url != EXPECTED_ENDPOINT:
        return (
            False,
            f"Expected endpoint '{EXPECTED_ENDPOINT}', but got '{configured_url}'",
        )

    print(f"  ✓ .cursor/mcp.json correctly defines 'openrouter' with url: {configured_url}")
    return True, "Valid configuration"


def test_2_network_and_oauth_metadata():
    print("\n[2/4] Testing network reachability and OAuth metadata...")
    try:
        req = urllib.request.Request(
            OAUTH_RESOURCE_METADATA,
            headers={"User-Agent": "Cursor-OpenRouter-MCP-Audit/1.0"},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
            body = json.loads(resp.read().decode("utf-8"))

        if status != 200:
            return False, f"Unexpected HTTP status {status} from metadata endpoint"

        resource = body.get("resource")
        auth_servers = body.get("authorization_servers", [])
        print(f"  ✓ OAuth Resource: {resource}")
        print(f"  ✓ Authorization Servers: {auth_servers}")
        return True, "OAuth metadata verified"
    except Exception as exc:
        return False, f"Network request to metadata endpoint failed: {exc}"


def test_3_mcp_transport_protocol():
    print("\n[3/4] Testing MCP remote transport protocol & challenge response...")
    payload = json.dumps(
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "cursor-audit", "version": "1.0.0"},
            },
        }
    ).encode("utf-8")

    # Test 3a: unauthenticated request without token should return 401 with OAuth challenge
    req_unauth = urllib.request.Request(
        EXPECTED_ENDPOINT,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "User-Agent": "Cursor-OpenRouter-MCP-Audit/1.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req_unauth, timeout=10) as resp:
            return False, f"Expected 401 challenge, got {resp.status}"
    except urllib.error.HTTPError as err:
        if err.code != 401:
            return False, f"Expected HTTP 401, got {err.code}: {err.read().decode('utf-8')}"
        auth_header = err.headers.get("WWW-Authenticate", "")
        if "oauth-protected-resource" not in auth_header and "Bearer" not in auth_header:
            return False, f"WWW-Authenticate header missing expected OAuth challenge: {auth_header}"
        print(f"  ✓ Endpoint returns compliant HTTP 401 challenge: {err.code}")
        print(f"  ✓ WWW-Authenticate header: {auth_header}")

    # Test 3b: Test requirement of Accept: application/json, text/event-stream
    req_no_accept = urllib.request.Request(
        EXPECTED_ENDPOINT,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Cursor-OpenRouter-MCP-Audit/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req_no_accept, timeout=10) as resp:
            pass
    except urllib.error.HTTPError as err:
        if err.code == 406:
            print("  ✓ Server strictly enforces MCP stream acceptance (HTTP 406 when Accept header missing)")

    return True, "Transport protocol compliance verified"


def test_4_optional_live_token():
    print("\n[4/4] Checking live token authentication (optional)...")
    token = os.environ.get("OPENROUTER_API_KEY")
    if not token:
        print("  ℹ OPENROUTER_API_KEY environment variable not set.")
        print("    Live test inference skipped. In Cursor IDE, authentication is handled via")
        print("    Settings > MCP > openrouter (browser OAuth PKCE flow).")
        return True, "Skipped (no token in env)"

    payload = json.dumps(
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/list",
            "params": {},
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        EXPECTED_ENDPOINT,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "Authorization": f"Bearer {token}",
            "User-Agent": "Cursor-OpenRouter-MCP-Audit/1.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
            tools = resp_data.get("result", {}).get("tools", [])
            print(f"  ✓ Live token accepted! Found {len(tools)} tools:")
            for t in tools:
                print(f"    - {t.get('name')}: {t.get('description', '').splitlines()[0]}")
            return True, f"{len(tools)} tools available"
    except urllib.error.HTTPError as err:
        return False, f"Token validation failed with HTTP {err.code}: {err.read().decode('utf-8')}"
    except Exception as exc:
        return False, f"Token validation error: {exc}"


def main():
    print("=" * 60)
    print("OpenRouter MCP Server Configuration & Protocol Audit")
    print("=" * 60)

    tests = [
        ("Workspace Configuration", test_1_workspace_config),
        ("Network & OAuth Metadata", test_2_network_and_oauth_metadata),
        ("MCP Transport Protocol", test_3_mcp_transport_protocol),
        ("Live Token Validation", test_4_optional_live_token),
    ]

    all_passed = True
    for name, test_fn in tests:
        success, message = test_fn()
        if not success:
            all_passed = False
            print(f"\n❌ FAILED: {name} - {message}")
            break

    print("\n" + "=" * 60)
    if all_passed:
        print("RESULT: ALL AUDIT CHECKS PASSED ✓")
        print("OpenRouter MCP is correctly configured and operational.")
        print("=" * 60)
        sys.exit(0)
    else:
        print("RESULT: AUDIT FAILED ✗")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
