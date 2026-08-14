#!/usr/bin/env python3
"""Migrate Nuxt Content posts to XHBlogs markdown format."""

from __future__ import annotations

import re
import shutil
from pathlib import Path

SOURCE = Path("/tmp/archiyun-backup/posts")
TARGET = Path("/home/ubuntu/projects/archiyun/XHBlogs/posts")


def parse_frontmatter(text: str) -> tuple[dict[str, str | list], str]:
    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    fm_text, body = parts[1], parts[2].lstrip("\n")
    data: dict[str, str | list] = {}
    current_key: str | None = None
    for line in fm_text.strip().splitlines():
        if not line.strip():
            continue
        if line.startswith("  - "):
            if current_key:
                data.setdefault(current_key, [])
                if isinstance(data[current_key], list):
                    data[current_key].append(line.strip()[2:].strip())
            continue
        match = re.match(r"^(\w+):\s*(.*)$", line)
        if not match:
            continue
        key, value = match.group(1), match.group(2).strip()
        current_key = key
        if value.startswith("[") and value.endswith("]"):
            items = [item.strip().strip("'\"") for item in value[1:-1].split(",") if item.strip()]
            data[key] = items
        elif value:
            data[key] = value.strip("'\"")
        else:
            data[key] = []
    return data, body


def format_date(value: str) -> str:
    value = value.strip()
    if re.match(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$", value):
        return value
    if re.match(r"^\d{4}-\d{2}-\d{2}$", value):
        return f"{value} 00:00:00"
    return value


def yaml_quote(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def convert_frontmatter(data: dict[str, str | list]) -> str:
    title = str(data.get("title", "Untitled"))
    description = str(data.get("description", ""))
    date = format_date(str(data.get("date", "1970-01-01")))
    tags: list[str] = []
    if isinstance(data.get("tags"), list):
        tags.extend(str(t) for t in data["tags"])
    if isinstance(data.get("categories"), list):
        for cat in data["categories"]:
            cat_str = str(cat)
            if cat_str not in tags:
                tags.append(cat_str)

    lines = [
        "---",
        f"title: {yaml_quote(title)}",
        f'date: "{date}"',
    ]
    if description:
        lines.append(f"description: {yaml_quote(description)}")
    if tags:
        tag_items = ", ".join(yaml_quote(t) for t in tags)
        lines.append(f"tags: [{tag_items}]")
    lines.append("---")
    return "\n".join(lines)


def strip_mdc(body: str) -> str:
    body = re.sub(r":blur\[([^\]]+)\]", r"\1", body)

    # Unwrap block components while preserving inner markdown.
    block_open = re.compile(r"^::[\w-]+(?:\{[^}]*\})?\s*$")
    block_close = re.compile(r"^::\s*$")
    output: list[str] = []
    depth = 0
    for line in body.splitlines():
        if block_open.match(line):
            depth += 1
            continue
        if block_close.match(line):
            depth = max(0, depth - 1)
            continue
        output.append(line)

    cleaned = "\n".join(output)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip() + "\n"


def slug_from_path(path: Path) -> str:
    slug = path.stem
    slug = re.sub(r"[^\w\-() ]", "-", slug)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug.lower() if slug else "post"


def main() -> None:
    if TARGET.exists():
        shutil.rmtree(TARGET)
    TARGET.mkdir(parents=True)

    migrated = 0
    for src in sorted(SOURCE.rglob("*.md")):
        raw = src.read_text(encoding="utf-8")
        data, body = parse_frontmatter(raw)
        slug = slug_from_path(src)
        frontmatter = convert_frontmatter(data)
        content = strip_mdc(body)
        (TARGET / f"{slug}.md").write_text(f"{frontmatter}\n\n{content}", encoding="utf-8")
        migrated += 1
        print(f"migrated: {src.name} -> {slug}.md")

    print(f"done: {migrated} posts")


if __name__ == "__main__":
    main()
