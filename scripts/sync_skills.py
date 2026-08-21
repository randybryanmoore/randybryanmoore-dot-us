#!/usr/bin/env python3
import os, shutil

SKILL_NAMES = ['build-agent-telemetry', 'web-annotation-feedback']
HOME_SKILLS_DIR = os.path.expanduser('~/.gemini/config/skills')
REPO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CLAUDE_SKILLS_DIR = os.path.join(REPO_DIR, '.claude/skills')
AGENTS_SKILLS_DIR = os.path.join(REPO_DIR, '.agents/skills')

for skill in SKILL_NAMES:
    locations = [
        os.path.join(HOME_SKILLS_DIR, skill, 'SKILL.md'),
        os.path.join(CLAUDE_SKILLS_DIR, skill, 'SKILL.md'),
        os.path.join(AGENTS_SKILLS_DIR, skill, 'SKILL.md'),
    ]
    
    existing = [(loc, os.path.getmtime(loc)) for loc in locations if os.path.exists(loc)]
    if not existing:
        continue
    
    existing.sort(key=lambda x: x[1], reverse=True)
    newest_src = existing[0][0]
    
    print(f'Syncing skill "{skill}" from {newest_src}...')
    for loc in locations:
        os.makedirs(os.path.dirname(loc), exist_ok=True)
        if loc != newest_src:
            shutil.copy2(newest_src, loc)
            print(f'  ✓ Updated {loc}')

print('All cross-platform skills synchronized successfully!')
