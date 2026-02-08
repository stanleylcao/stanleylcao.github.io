#!/usr/bin/env python3
"""
Build script for A Curious Critter personal website.

Scans essay files in essays/, extracts metadata from <meta> tags,
retrieves dates from git history, and generates essays/manifest.json.

Usage:
    python3 build.py

Run this before committing to keep the essay manifest up to date.
The manifest is read by essays.html (listing) and individual essay
pages (date display) at runtime.
"""

import os
import json
import subprocess
from html.parser import HTMLParser
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ESSAYS_DIR = os.path.join(SCRIPT_DIR, 'essays')
MANIFEST_PATH = os.path.join(ESSAYS_DIR, 'manifest.json')


class MetaExtractor(HTMLParser):
    """Extract <meta name="essay-*" content="..."> tags from HTML."""

    def __init__(self):
        super().__init__()
        self.meta = {}

    def handle_starttag(self, tag, attrs):
        if tag == 'meta':
            d = dict(attrs)
            name = d.get('name', '')
            content = d.get('content', '')
            if name.startswith('essay-'):
                self.meta[name[6:]] = content  # strip 'essay-' prefix


def git_date(filepath, first=False):
    """
    Get a git commit date for a file (YYYY-MM-DD).
    If first=True, returns the date of the first commit that added the file.
    Otherwise, returns the date of the most recent commit touching it.
    Returns None if the file has no git history.
    """
    try:
        cmd = ['git', 'log', '--format=%aI']
        if first:
            cmd += ['--diff-filter=A', '--follow']
        else:
            cmd += ['-1']
        cmd += ['--', filepath]
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=SCRIPT_DIR)
        if result.returncode != 0 or not result.stdout.strip():
            return None
        lines = result.stdout.strip().split('\n')
        raw = lines[-1] if first else lines[0]
        return raw[:10]  # YYYY-MM-DD
    except FileNotFoundError:
        return None


def file_date(filepath):
    """Fallback: file modification time as YYYY-MM-DD."""
    return datetime.fromtimestamp(os.path.getmtime(filepath)).strftime('%Y-%m-%d')


def main():
    if not os.path.isdir(ESSAYS_DIR):
        print(f'No essays/ directory found at {ESSAYS_DIR}')
        return

    essays = []

    for name in sorted(os.listdir(ESSAYS_DIR)):
        if not name.endswith('.html') or name.startswith('_'):
            continue

        path = os.path.join(ESSAYS_DIR, name)

        # Extract meta tags
        parser = MetaExtractor()
        with open(path, encoding='utf-8') as f:
            parser.feed(f.read())

        if not parser.meta.get('title'):
            print(f'  skip  {name}  (no <meta name="essay-title">)')
            continue

        # Dates from git, with file-mtime fallback
        fallback = file_date(path)
        published = git_date(path, first=True) or fallback
        updated = git_date(path, first=False) or fallback

        essays.append({
            'file': name,
            'title': parser.meta.get('title', ''),
            'excerpt': parser.meta.get('excerpt', ''),
            'lang': parser.meta.get('lang', 'en'),
            'published': published,
            'updated': updated,
        })

    # Sort newest first
    essays.sort(key=lambda e: e['published'], reverse=True)

    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(essays, f, indent=2, ensure_ascii=False)

    print(f'Wrote {MANIFEST_PATH}  ({len(essays)} essay(s))')
    for e in essays:
        print(f'  {e["published"]}  {e["title"]}  [{e["lang"]}]')


if __name__ == '__main__':
    main()
