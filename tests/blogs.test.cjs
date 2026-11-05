const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function page(fetch, ids = ['blog-container', 'recent-posts-list']) {
    const containers = Object.fromEntries(ids.map(id => [id, {
        innerHTML: '', children: [], appendChild(child) { this.children.push(child); }
    }]));
    const context = vm.createContext({ fetch, console: { error() {} }, document: {
        addEventListener() {}, getElementById(id) { return containers[id]; },
        createElement() { return { innerHTML: '', className: '' }; }
    }});
    vm.runInContext(fs.readFileSync('js/blogs.js', 'utf8'), context);
    return { context, containers };
}

const items = Array.from({ length: 5 }, (_, i) => ({
    title: `Post ${i}`, link: `https://medium.com/p/${i}`,
    pubDate: '2026-01-02T00:00:00Z', categories: ['engineering']
}));

test('both blog sections render from same-origin data without the RSS proxy', async () => {
    const urls = [];
    const { context, containers } = page(async url => {
        urls.push(url);
        return url === 'blogs.json'
            ? { ok: true, json: async () => ({ items }) }
            : { ok: false, status: 503, json: async () => ({ status: 'error' }) };
    });
    await context.fetchMediumBlogs();
    assert.equal(containers['blog-container'].children.length, 5);
    assert.equal(containers['recent-posts-list'].children.length, 4);
    assert.deepEqual(urls, ['blogs.json']);
});
