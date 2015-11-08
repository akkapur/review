'use strict';
var exec = require('child_process').exec,
	npmModules = [
		'grunt-coffeelint',
		'grunt-contrib-clean',
		'grunt-contrib-compress',
		'grunt-contrib-less',
		'grunt-contrib-concat',
		'grunt-contrib-copy',
		'grunt-contrib-cssmin',
		'grunt-contrib-jshint',
		'grunt-contrib-uglify',
		'grunt-contrib-watch',
		'grunt-cssurlrev',
		'grunt-env',
		'grunt-express-server',
		'grunt-exec',
		'grunt-filerev',
		'grunt-filerev-assets',
		'grunt-jscs-checker',
		'grunt-jssourcemaprev',
		'grunt-karma',
		'grunt-mocha-cov',
		'grunt-mocha-test',
		'grunt-angular-templates',
		'grunt-protractor-runner',
		'grunt-protractor-webdriver',
		'grunt-replace',
		'grunt-usemin'
	],
	vendor = require('./vendor-dependencies'),
	version = 'latest';

module.exports = function(grunt) {

	npmModules.forEach(grunt.loadNpmTasks);

	grunt.registerTask('prebuild', 'Runs lint and stylecheck tasks', [
		'jshint',
		'jscs',
		'coffeelint'
	]);

	grunt.task.renameTask('watch', '_watch');
	grunt.registerTask('watch', 'Runs grunt watch after starting up a karma server', [
		'karma:watch:start',
		'_watch'
	]);

	grunt.registerTask('dev', 'Useful for quick development', [
		'_watch:dev'
	]);

	grunt.registerTask('default', 'Runs all build tasks that should pass before commit', [
		'prebuild',
		'build',
		'test'
	]);

	grunt.registerTask(
		'quick-build',
		'Build without installing production dependencies. Useful for development',
		[
			'clean',
			'copy',
			'ngtemplates',
			'uglify:vendor',
			'concat',
			'less',
			'cssmin',
			'uglify:js',
			'version_assets'
		]);

	grunt.registerTask('build', 'Copy, concat and minify everything, etc', [
		'quick-build',
		'exec:npmInstallProd'
	]);

	grunt.registerTask('rebuild', 're-concat and re-minify everything, etc', [
		'copy',
		'uglify:vendor',
		'concat',
		'uglify:js'
	]);

	grunt.registerTask('jenkins', 'Runs all build tasks needed by jenkins for CI', [
		'prebuild',
		'build',
		'test',
		'compress'
	]);

	grunt.registerTask('npmInstallProd', function() {
		var cb = this.async();
		exec('cd dist && npm install --production', function() {
			cb();
		});
	});

	grunt.registerTask('translate', 'Get the transalations from languages repo.', [
		'quick-build'
	]);

	grunt.registerTask('version_assets', [
		'filerev',
		'filerev_assets',
		'jssourcemaprev',
		'cssurlrev',
		'replace',
		'usemin'
	]);

	grunt.registerMultiTask('test', 'Runs various test suites. Try :unit or :e2e', function() {
		// runs all tasks defined in the specific target's list, e.g., "test:unit" would run all
		// tasks in config.test.unit
		grunt.task.run(this.data);
	});

	var path = {
		client: 'src/client',
		server: 'src/server',
		test: 'test',
		dist: {
			base: 'dist',
			server: 'dist/server',
			'static': 'dist/static'
		}
	};

	grunt.initConfig({
		clean: {
			options: {
				force: true
			},
			dist: {
				files: [{
					dot: true,
					src: [path.dist.base]
				}]
			},
			deployable: ['deployable_*.zip']
		},
		coffeelint: {
			options: {
				no_tabs: { level: 'ignore' },
				max_line_length: { value: 100 },
				indentation: { value: 1 }
			},
			test: {
				files: {
					src: [ path.test + '/**/*.coffee' ]
				},
			}
		},
		compress: {
			deployment: {
				options: {
					archive: 'deployable_' + version + '.zip'
				},
				files: [{
					src: [ path.dist.base + '/**/*', './config/**/*', '!./config/runtime.*' ],
					dest: './'
				}]
			}
		},
		concat: {
			js: {
				src: [
					path.client + '/app/**/*.js',
					path.dist.base + '/templates.js'
				],
				dest: path.dist.static + '/js/reviewclient.js'
			},
			vendorJS: {
				src: vendor.src,
				dest: path.dist.static + '/vendor/vendor.js'
			},
			vendorJSMin: {
				src: vendor.min.concat(path.client + '/vendor/vendor.min.js'),
				dest: path.dist.static + '/vendor/vendor.min.js'
			},
			vendorCSS: {
				src: [
					path.client + '/vendor/bootstrap/dist/css/bootstrap.min.css',
					path.client + '/vendor/jquery-ui/themes/base/minified/jquery-ui.min.css',
				],
				dest: path.dist.static + '/vendor/vendor.css'
			}
		},
		copy: {
			options: {
				mode: true
			},
			server: {
				expand: true,
				cwd: path.server + '/',
				src: '**/*',
				dest: path.dist.base + '/server/'
			},
			img: {
				expand: true,
				cwd: path.client + '/img',
				src: '**/*',
				dest: path.dist.static + '/img/'
			},
			'package': {
				src: 'package.json',
				dest: path.dist.base + '/'
			}
		},
		cssmin: {
			target: {
				files: [{
					src: path.dist.static + '/vendor/vendor.css',
					dest: path.dist.static + '/vendor/vendor.min.css',
				}, {
					src: path.dist.static + '/css/reviewclient.css',
					dest: path.dist.static + '/css/reviewclient.min.css',
				}]
			}
		},
		cssurlrev: {
			options: {
				assets: path.dist.base + '/assets.json'
			},
			files: {
				src: [path.dist.static + '/css/**/*.css']
			}
		},
		exec: {
			npmInstallProd: {
				cwd: path.dist.base + '',
				command: 'npm install --production && rm package.json'
			}
		},
		express: {
			dev: {
				options: {
					script: path.dist.base + '/server/server.js',
					port: 3000
				}
			},
			test: {
				options: {
					script: path.dist.base + '/server/server.js',
					port: 3002
				}
			},
			testApi: {
				options: {
					opts: ['node_modules/coffee-script/bin/coffee'],
					script: 'test/api/app.coffee',
					port: 3333
				}
			},
			testMongo: {
				options: {
					opts: ['node_modules/coffee-script/bin/coffee'],
					script: 'test/api/dbapp.coffee',
					port: 3334
				}
			}
		},
		filerev: {
			js: {
				src: [
					path.dist.static + '/{css,img,js,vendor,fonts}/' +
						'*.{css,js,png,jpg,gif,eot,svg,ttf,woff,woff2}'
				]
			}
		},
		filerev_assets: {
			dist: {
				options: {
					dest: 'dist/assets.json',
					cwd: 'dist/static/',
					prefix: '/review/static/'
				}
			}
		},
		jshint: {
			client: {
				files: {
					src: [path.client + '/app/**/*.js']
				},
				options: {
					jshintrc: path.client + '/.jshintrc'
				}
			},
			server: {
				files: {
					src: [
						'*.js',
						path.server + '/**/*.js'
					]
				},
				options: {
					jshintrc: '.jshintrc'
				}
			},
			test: {
				files: {
					src: [
						path.test + '/client/**/*.spec.js',
						path.test + '/server/**/*.spec.js',
						path.test + '/e2e/**/*[spec|test].js'
					]
				},
				options: {
					jshintrc: path.test + '/.jshintrc'
				}
			}
		},
		jscs: {
			src: [
				"*.js", "src/client/app/**/*.js", "src/server/**/*.js",
				"test/client/**/*.js", "test/e2e/**/*.js", "test/server/**/*.js"
			],
			options: {
				config: ".jscs.json"
			}
		},
		jssourcemaprev: {
			files: {
				src: [path.dist.static + '/{js}/**/*.js']
			}
		},
		karma: {
			options: {
				configFile: path.test + '/client/karma.conf.js'
			},
			unit: {
				singleRun: true,
				browsers: ['PhantomJS']
			},
			watch: {
				background: true,
				browsers: ['PhantomJS']
			}
		},
		less: {
			files: {
				src: [path.client + '/less/**/*.less'],
				dest: path.dist.static + '/css/reviewclient.css',
				ext: '.css'
			}
		},
		mochacov: {
			options: {
				reporter: 'html-cov',
				require: 'coffee-script/register',
				quiet: true,
				output: 'coverage/server-coverage.html'
			},
			files: {
				src: [
					'test/server/**/*.{js,coffee}'
				]
			}
		},
		mochaTest: {
			options: {
				clearRequireCache: true,
				reporter: 'spec',
				require: 'coffee-script/register'
			},
			files: {
				src: [
					'test/server/**/*.{js,coffee}'
				]
			}
		},
		ngtemplates: {
			client: {
				cwd: path.client + '/app/templates',
				src: '**/*.html',
				dest: path.dist.base + '/templates.js',
				options: {
					prefix: '/',
					module: 'review-client',
					htmlmin: { collapseWhitespace: true, collapseBooleanAttributes: true }
				}
			}
		},
		protractor: {
			options: {
				keepAlive: false, // If true, the build continues even if the tests fail.
				configFile: path.test + "/e2e/conf/protractor.conf.coffee"
			},
			dev: {
				options: {
					args: {
						browser: 'chrome'
					}
				}
			},
			continuous: {
				options: {
					args: {
						browser: 'phantomjs'
					}
				}
			}
		},
		protractor_webdriver: {
			e2e: {
				options: {
					path: 'node_modules/protractor/bin/',
					command: 'webdriver-manager start'
				}
			}
		},
		replace: {
			dist: {
				options: {
					patterns: [{
						match: /"fonts/g,
						replacement: '"dist/static/fonts'
					}, {
						match: /"img/g,
						replacement: '"dist/static/img'
					}]
				},
				files: [{
					expand: false,
					flatten: true,
					src: 'dist/assets.json',
					dest: 'dist/assetscss.json'
				}]
			}
		},
		test: {
			unit: ['karma:unit', 'mochaTest', 'mochacov']
			/**e2e: [
				'protractor_webdriver:e2e',
				'express:testApi',
				'env:test',
				'express:testMongo',
				'express:test',
				'protractor:continuous',
				'express:dev:stop',
				'express:testMongo:stop',
				'express:testApi:stop'
			]**/
		},
		uglify: {
			js: {
				options: {
					sourceMap: true
				},
				files: {
					'dist/static/js/reviewclient.min.js': [
						path.client + '/app/**/*.js',
						path.dist.base + '/templates.js'
					]
				}
			},
			vendor: {
				files: {
					'src/client/vendor/vendor.min.js': vendor.noMinProvided
				}
			}
		},
		usemin: {
			css: path.dist.static + '/**/*.css',
			options: {
				revmap: path.dist.base + '/assetscss.json',
			}
		},
		_watch: {
			test: {
				files: ['!src/client/vendor/**/*', 'src/**/*.js', 'test/client/**/*', 'test/server/**/*'],
				tasks: ['prebuild', 'karma:watch:run', 'mochaTest']
			},
			dev: {
				options: {
					nospawn: true,
					livereload: true
				},
				files: ['src/**/*.{js,html,less}'],
				tasks: ['quick-build', 'express:dev']
			}
		},
		env: {
			dev: {
				NODE_ENV: 'dev'
			},
			test: {
				NODE_ENV: 'test'
			}
		}
	});
};
