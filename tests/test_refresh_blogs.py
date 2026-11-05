import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/refresh_blogs.py'


class RefreshTests(unittest.TestCase):
    def test_refresh_converts_rss_and_keeps_cache_on_invalid_feed(self):
        with tempfile.TemporaryDirectory(dir=Path.cwd()) as directory:
            folder = Path(directory)
            feed = folder / 'feed.xml'
            output = folder / 'blogs.json'
            feed.write_text('''<rss><channel><item><title>A &amp; B</title>
<link>https://medium.com/p/real</link>
<pubDate>Fri, 02 Jan 2026 00:00:00 GMT</pubDate>
<category>engineering</category></item></channel></rss>''')
            command = [sys.executable, str(SCRIPT), '--feed-url', feed.as_uri(), '--output', str(output)]
            result = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            data = json.loads(output.read_text())
            self.assertEqual(data['items'], [{
                'title': 'A & B', 'link': 'https://medium.com/p/real',
                'pubDate': '2026-01-02T00:00:00+00:00', 'categories': ['engineering']
            }])
            previous = output.read_bytes()
            for invalid in ['<html>Rate limited</html>', '<rss><channel/></rss>', 'not XML']:
                feed.write_text(invalid)
                result = subprocess.run(command, capture_output=True, text=True)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(output.read_bytes(), previous)


if __name__ == '__main__':
    unittest.main()
