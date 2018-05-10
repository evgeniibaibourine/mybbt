'use strict';

angular.module('myApp.location', ['ngRoute', 'ngMaterial'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/location', {
        templateUrl: 'Location/location.html',
        controller: 'LocationCtrl'
    });
}])

.controller('LocationCtrl', [function() {

}]);