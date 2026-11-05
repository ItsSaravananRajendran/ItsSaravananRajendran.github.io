from html.parser import HTMLParser
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ProjectParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.dates = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'article' and 'project-item' in (attrs.get('class') or '').split():
            self.dates.append(attrs['data-created'])
        if tag == 'a':
            self.links.append(attrs.get('href', ''))


class ProjectsTests(unittest.TestCase):
    def test_hosted_projects_are_linked_newest_first(self):
        page = ROOT / 'projects.html'
        self.assertTrue(page.exists(), 'Projects page must exist')
        parser = ProjectParser()
        parser.feed(page.read_text())
        self.assertEqual(len(parser.dates), 5)
        self.assertEqual(parser.dates, sorted(parser.dates, reverse=True))
        for name in ['health-sim', 'raagsapp', 'thirukural-pyramid', 'xceed', 'PingPongGame']:
            self.assertIn(f'https://itssaravananrajendran.github.io/{name}/', parser.links)
            self.assertIn(f'https://github.com/ItsSaravananRajendran/{name}', parser.links)
        self.assertNotIn('https://itssaravananrajendran.github.io/chat/', parser.links)

    def test_projects_are_discoverable_from_every_main_page(self):
        for name in ['index', 'blogs', 'papershelf', 'bookshelf', 'experience', 'accomplishments']:
            with self.subTest(page=name):
                parser = ProjectParser()
                parser.feed((ROOT / f'{name}.html').read_text())
                self.assertIn('projects.html', parser.links)


if __name__ == '__main__':
    unittest.main()
