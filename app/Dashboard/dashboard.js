'use strict';

angular.module('myApp.dashboard', ['ngRoute', 'ngMaterial'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/dashboard', {
        templateUrl: 'Dashboard/dashboard.html',
        controller: 'DashboardCtrl'
    });
}])

.controller('DashboardCtrl', [function() {

}]);