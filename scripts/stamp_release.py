#!/usr/bin/env python3
"""Stamp the symphony release manifests with real deployment provenance.

Replaces the manual step that previously left `deployment_workflow_run`
unrecorded (or, worse, stale from an earlier release). Reads the deploy run
straight from the GitHub Actions API, which needs no auth and no `gh` CLI
because the repository is public.

Usage:
    python3 scripts/stamp_release.py             # stamp HEAD's deploy run
    python3 scripts/stamp_release.py <sha>       # stamp a specific commit's run

Run it AFTER pushing, once the workflow has finished. It refuses to record a
run that is still in progress rather than claiming a deploy that has not
landed, and it recomputes artifact hashes so they match what actually shipped.
"""

import datetime
import hashlib
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

REPO = "randybryanmoore/randybryanmoore-dot-us"
SYMPHONY = Path(__file__).resolve().parent.parent / "symphony"
MANIFESTS = [
    ("one_pager-release-manifest.json", "OP", "surface_version",
     ["one_pager.html", "styles.css", "script.js"]),
    ("release-manifest.json", "Dossier", "service_version", None),
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def git(*args: str) -> str:
    return subprocess.run(["git", *args], capture_output=True, text=True,
                          cwd=SYMPHONY.parent).stdout.strip()


def find_run(sha: str) -> dict:
    url = f"https://api.github.com/repos/{REPO}/actions/runs?per_page=30"
    with urllib.request.urlopen(url, timeout=30) as fh:
        runs = json.load(fh)["workflow_runs"]
    for run in runs:
        if run["head_sha"].startswith(sha):
            return run
    raise SystemExit(
        f"No workflow run found for {sha}. Has it been pushed, and has the "
        f"workflow started yet?"
    )


def main() -> None:
    sha = (sys.argv[1] if len(sys.argv) > 1 else git("rev-parse", "HEAD"))[:7]
    run = find_run(sha)

    if run["status"] != "completed":
        raise SystemExit(
            f"Run {run['id']} for {sha} is still {run['status']}. Wait for it "
            f"to finish, then re-run. Refusing to stamp an unfinished deploy."
        )
    if run["conclusion"] != "success":
        print(f"WARNING: run {run['id']} concluded '{run['conclusion']}', not "
              f"'success'. Recording it truthfully anyway.", file=sys.stderr)

    now = datetime.datetime.now().astimezone().replace(microsecond=0).isoformat()

    for name, label, version_key, artifacts in MANIFESTS:
        path = SYMPHONY / name
        data = json.loads(path.read_text())
        version = data.get(version_key, "?")

        data["lifecycle"] = {
            **data.get("lifecycle", {}),
            "local": True,
            "committed": True,
            "pushed": True,
            "deployed": run["conclusion"] == "success",
            "production_verified": run["conclusion"] == "success",
            "release_checkpoint": sha,
            "deployment_workflow_run": str(run["id"]),
            "deployment_workflow_name": run["name"],
            "deployment_workflow_conclusion": run["conclusion"],
            "deployment_workflow_url": run["html_url"],
            "deployed_at": run["updated_at"],
            "verified_at": now,
        }
        data["validation"] = {
            **data.get("validation", {}),
            "deployment_run_captured": (
                f"pass: run {run['id']} ({run['conclusion']}) deployed "
                f"{sha}, retrieved from the public Actions API"
            ),
        }

        if artifacts:
            data["artifacts"] = [
                {"path": p, "sha256": sha256(SYMPHONY / p)} for p in artifacts
            ]
        else:
            for artifact in data.get("artifacts", []):
                target = SYMPHONY / artifact.get("path", "")
                if target.is_file():
                    artifact["sha256"] = sha256(target)

        path.write_text(json.dumps(data, indent=2) + "\n")
        print(f"  {label} v{version} -> run {run['id']} ({run['conclusion']})")

    print(f"\nStamped both manifests from {run['html_url']}")
    print("Commit and push the manifests to publish the corrected provenance.")


if __name__ == "__main__":
    main()
