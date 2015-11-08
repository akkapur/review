module.exports = function(env, json) {
	return {
		js: function(key) {
			if (env === 'dev') {
				return json[key + '.js'];
			}
			return json[key + '.min.js'];
		},
		css: function(key) {
			if (env === 'dev') {
				return json[key + '.css'];
			}
			return json[key + '.min.css'];
		}
	};
};