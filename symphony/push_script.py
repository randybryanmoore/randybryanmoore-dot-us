#!/usr/bin/env python3
"""Prepare and verify the Symphony Pages artifact.

Deployment belongs to the primary repository's GitHub Pages workflow. This
helper performs deterministic local checks only: it never reads credentials,
calls GitHub, rewrites Git history, or claims that a deployment passed.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent
ARCHIVE = ROOT / "Randy_Bryan_Moore_Richmond_Symphony_Dossier.zip"
MANIFEST = ROOT / "release-manifest.json"

ARCHIVE_MEMBERS = (
    "index.html",
    "styles.css",
    "script.js",
    "one_pager.html",
    "dashboard.html",
    "Randy_Bryan_Moore.vcf",
    "Randy_Bryan_Moore_Resume.pdf",
    "Randy_Bryan_Moore_Cover_Letter.pdf",
    "Randy_Bryan_Moore_Executive_Briefing.pdf",
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_archive() -> None:
    with zipfile.ZipFile(ARCHIVE, "w", zipfile.ZIP_DEFLATED) as bundle:
        for relative in ARCHIVE_MEMBERS:
            source = ROOT / relative
            if source.exists():
                bundle.write(source, arcname=relative)
        for image in sorted((ROOT / "images").glob("*")):
            if image.is_file() and not image.name.startswith("."):
                bundle.write(image, arcname=f"images/{image.name}")
    print(f"Built {ARCHIVE.name} ({ARCHIVE.stat().st_size} bytes)")


def verify_release() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    failures: list[str] = []
    for artifact in manifest.get("artifacts", []):
        path = ROOT / artifact["path"]
        if not path.is_file():
            failures.append(f"missing artifact: {artifact['path']}")
            continue
        actual = sha256(path)
        if actual != artifact["sha256"]:
            failures.append(
                f"digest mismatch: {artifact['path']} "
                f"(manifest {artifact['sha256']}, actual {actual})"
            )

    cname = (ROOT / "CNAME").read_text(encoding="utf-8").strip()
    if cname != "symphony.randybryanmoore.us":
        failures.append("CNAME must contain symphony.randybryanmoore.us")

    with zipfile.ZipFile(ARCHIVE) as bundle:
        bad_member = bundle.testzip()
        if bad_member:
            failures.append(f"corrupt ZIP member: {bad_member}")

    if failures:
        raise SystemExit("Release verification failed:\n- " + "\n- ".join(failures))
    print("Release verification passed; deployment status remains unasserted.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--build", action="store_true", help="rebuild the offline ZIP")
    parser.add_argument("--verify", action="store_true", help="verify manifest digests and Pages files")
    args = parser.parse_args()
    if not args.build and not args.verify:
        parser.error("choose --build and/or --verify")
    if args.build:
        build_archive()
    if args.verify:
        verify_release()
    return 0


if __name__ == "__main__":
    sys.exit(main())
