module.exports = {
	apps: [
		{
			name: 'Jira App',
			script: 'index.js',
			watch: false,
			instances: 'max',
			env: {
				NODE_ENV: 'development'
			},
			env_production: {
				NODE_ENV: 'production'
			}
		}
	]
};
