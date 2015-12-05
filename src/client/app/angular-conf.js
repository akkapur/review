'use strict';

angular.module('review-client', [
	'ngRoute',
	'mgcrea.ngStrap.modal',
	'mgcrea.ngStrap.alert',
	'mgcrea.ngStrap.tooltip',
	'mgcrea.ngStrap.datepicker'
])
.config([
	'$routeProvider',
	function($routeProvider) {
		$routeProvider.when('/surveys/:canonicalId', { templateUrl: '/responses/views/partials/home', controller: 'ResponseController' });
	}
]);