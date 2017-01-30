'use strict';

import resolveImplicitTag from '@emmetio/implicit-tag';
import latin from './lang/latin.json';
import ru from './lang/russian.json';
import sp from './lang/spanish.json';

const langs = { latin, ru, sp };

const defaultOptions = {
	wordCount: 30,
	skipCommon: false,
	lang: 'latin'
};

/**
 * Replaces given parsed Emmet abbreviation node with nodes filled with
 * Lorem Ipsum stub text.
 * @param {Node} node
 * @return {Node}
 */
export default function(node, options) {
	options = Object.assign({}, defaultOptions, options);
	const dict = langs[options.lang] || langs.latin;

	if (!node.repeat && !isRoot(node.parent)) {
		// non-repeating element, insert text stub as a content of parent node
		// and remove current one
		node.parent.value = paragraph(dict, options.wordCount, !options.skipCommon);
		node.remove();
	} else {
		// Replace named node with generated content
		const startWithCommon = !options.skipCommon && (!node.repeat || node.repeat.value === 1);
		node.value = paragraph(dict, options.wordCount, startWithCommon);
		if (node.name == null) {
			node.name = resolveImplicitTag(node.parent.name);
		}
	}

	return node;
}

function isRoot(node) {
	return !node.parent;
}

/**
 * Returns random integer between <code>from</code> and <code>to</code> values
 * @param {Number} from
 * @param {Number} to
 * @returns {Number}
 */
function rand(from, to) {
	return Math.floor(Math.random() * (to - from) + from);
}

/**
 * @param {Array} arr
 * @param {Number} count
 * @returns {Array}
 */
function sample(arr, count) {
	const len = arr.length;
	const iterations = Math.min(len, count);
	const result = new Set();

	while (result.size < iterations) {
		result.add(arr[rand(0, len)]);
	}

	return Array.from(result);
}

function choice(val) {
	return val[rand(0, val.length - 1)];
}

function sentence(words, end) {
	if (words.length) {
		words = [capitalize(words[0])].concat(words.slice(1));
	}

	return words.join(' ') + (end || choice('?!...')); // more dots than question marks
}

function capitalize(word) {
	return word[0].toUpperCase() + word.slice(1);
}

/**
 * Insert commas at randomly selected words. This function modifies values
 * inside <code>words</code> array
 * @param {Array} words
 */
function insertCommas(words) {
	if (words.length < 2) {
		return words;
	}

	words = words.slice();
	const len = words.length;
	const hasComma = /,$/;
	let totalCommas = 0;

	if (len > 3 && len <= 6) {
		totalCommas = rand(0, 1);
	} else if (len > 6 && len <= 12) {
		totalCommas = rand(0, 2);
	} else {
		totalCommas = rand(1, 4);
	}

	for (let i = 0, pos, word; i < totalCommas; i++) {
		pos = rand(0, len - 2);
		if (!hasComma.test(words[pos])) {
			words[pos] += ',';
		}
	}

	return words;
}

/**
 * Generate a paragraph of "Lorem ipsum" text
 * @param {Object} dict Words dictionary (see `lang/*.json`)
 * @param {Number} wordCount Words count in paragraph
 * @param {Boolean} startWithCommon Should paragraph start with common
 * "lorem ipsum" sentence.
 * @returns {String}
 */
function paragraph(dict, wordCount, startWithCommon) {
	const result = [];
	let totalWords = 0;
	let words;

	if (startWithCommon && dict.common) {
		words = dict.common.slice(0, wordCount);
		totalWords += words.length;
		result.push(sentence(insertCommas(words), '.'));
	}

	while (totalWords < wordCount) {
		words = sample(dict.words, Math.min(rand(2, 30), wordCount - totalWords));
		totalWords += words.length;
		result.push(sentence(insertCommas(words)));
	}

	return result.join(' ');
}
