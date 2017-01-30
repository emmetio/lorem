export default {
	entry: './index.js',
	external: ['@emmetio/implicit-tag'],
	plugins: [{
		name: 'json',
		transform(code, id) {
			return id.slice(-5) === '.json' ? `export default ${code}` : null;
		}
	}],
	targets: [
		{format: 'cjs', dest: 'dist/lorem.cjs.js'},
		{format: 'es',  dest: 'dist/lorem.es.js'}
	]
};
