#!/usr/bin/env python3
"""Refresh the checked-in blog feed; never replace good data on fetch/parse failure."""
import argparse
from datetime import timezone
from email.utils import parsedate_to_datetime
import json
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--feed-url', default='https://medium.com/feed/@saravananrajendran')
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parents[1] / 'blogs.json')
    args = parser.parse_args()
    request = Request(args.feed_url, headers={'User-Agent': 'SaravananBlogFeed/1.0'})
    with urlopen(request, timeout=30) as response:
        root = ET.fromstring(response.read())
    items = []
    for entry in root.findall('./channel/item'):
        title = (entry.findtext('title') or '').strip()
        link = (entry.findtext('link') or '').strip()
        date = parsedate_to_datetime(entry.findtext('pubDate') or '')
        if not title or urlparse(link).scheme != 'https' or not urlparse(link).netloc:
            raise ValueError('Feed contains an invalid title or link')
        items.append({
            'title': title, 'link': link,
            'pubDate': date.astimezone(timezone.utc).isoformat(),
            'categories': [category.text.strip() for category in entry.findall('category') if category.text]
        })
    if not items:
        raise ValueError('Feed contains no articles; keeping existing blogs.json')
    items.sort(key=lambda item: item['pubDate'], reverse=True)
    # Validate everything before atomically replacing the existing feed.
    temporary = args.output.with_suffix('.json.tmp')
    temporary.write_text(json.dumps({'items': items}, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    temporary.replace(args.output)
    print(f'Refreshed {len(items)} articles in {args.output}')


if __name__ == '__main__':
    main()
