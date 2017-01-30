'use strict';

const assert = require('assert');
const parser = require('@emmetio/abbreviation');
const SnippetsRegistry = require('@emmetio/snippets-registry');
const htmlTransform = require('@emmetio/html-transform');
const htmlSnippetsResolver = require('@emmetio/html-snippets-resolver');
require('babel-register');
const stringify = require('./assets/stringify').default;
const lorem = require('../index').default;

const registry = new SnippetsRegistry();
const reLorem = /^lorem([a-z]*)(\d*)$/;
const store = registry.add(new Map().set(reLorem, node => {
    const options = {};
    const m = node.name.match(reLorem);
    if (m[1]) {
        options.lang = m[1];
    }

    if (m[2]) {
        options.wordCount = +m[2];
    }

    return lorem(node, options);
}));

function parse(abbr) {
    return parser(abbr)
    .use(htmlTransform)
    .use(htmlSnippetsResolver, registry);
}

function expand(abbr) {
    return stringify(parse(abbr));
}

describe('Lorem Ipsum matcher', () => {
    const commonLorem = /^Lorem,?\sipsum,?\sdolor/;

    it('basic', () => {
        let tree = parse('lorem');
        assert.equal(tree.children.length, 1);

        let node = tree.firstChild;
        assert.equal(node.name, 'div');
        assert(commonLorem.test(node.value));
        assert(node.value.split(' ').length > 20);

        node = parse('lorem5').firstChild;
        assert.equal(node.name, 'div');
        assert(commonLorem.test(node.value));
        assert.equal(node.value.split(' ').length, 5);
    });

    it('set parent value', () => {
        const tree = parse('p>lorem');
        assert.equal(tree.children.length, 1);

        const node = tree.children[0];
        assert.equal(node.name, 'p');
        assert(/^Lorem,?\sipsum,?\sdolor/.test(node.value));
    });

    it('repeat', () => {
        const tree = parse('ul>lorem*3').firstChild;
        assert.equal(tree.children.length, 3);

        let node = tree.firstChild;
        assert.equal(node.name, 'li');
        assert(commonLorem.test(node.value));
        assert(node.value.split(' ').length > 20);

        node = tree.children[1];
        assert.equal(node.name, 'li');
        assert(!commonLorem.test(node.value));
        assert(node.value.split(' ').length > 20);
    });

    it('langs', () => {
        const tree = parse('ul>loremru10*3').firstChild;
        assert.equal(tree.children.length, 3);

        let node = tree.firstChild;
        assert.equal(node.name, 'li');
        assert(node.value.includes('горами'));

        node = tree.children[1];
        assert.equal(node.name, 'li');
        assert.equal(node.value.split(' ').length, 10);
    });
});
