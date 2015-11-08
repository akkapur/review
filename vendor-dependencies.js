/*
 * Client vendor source dependencies and ordering. Needed by
 * both the gruntfile and karma conf.
 */

function prependPath(resource) {
	return 'src/client/vendor/' + resource;
}

module.exports = {
	src: [
		'jquery/jquery.js',
		'angular/angular.js',
		'angular-route/angular-route.js',
		'angular-strap/dist/angular-strap.js',
		'angular-strap/dist/angular-strap.tpl.js',
		'moment/moment.js',
		'moment-timezone/moment-timezone.js',
		'lodash/lodash.js',
		'jquery-ui/ui/jquery-ui.js'
	].map(prependPath),
	min: [
		'jquery/jquery.min.js',
		'angular/angular.min.js',
		'angular-route/angular-route.min.js',
		'angular-strap/dist/angular-strap.min.js',
		'angular-strap/dist/angular-strap.tpl.min.js',
		'moment/min/moment.min.js',
		'moment-timezone/builds/moment-timezone.min.js',
		'lodash/lodash.min.js',
		'jquery-ui/ui/minified/jquery-ui.min.js',
		'vendor.min.js'
	].map(prependPath),
	noMinProvided: [
	].map(prependPath)
};