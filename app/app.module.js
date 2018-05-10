'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.dashboard',
    'myApp.location'
]).
config(['$routeProvider', function($routeProvider) {
    $routeProvider.hashPrefix('');
    $routeProvider.otherwise({ redirectTo: '/dashboard' });
}]);