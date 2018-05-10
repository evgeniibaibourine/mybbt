'use strict';

angular.module('myApp.dashboard', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/dashboard', {
        templateUrl: 'app/components/Dashboard/dashboardView.html',
        controller: 'DashboardCtrl'
    });
}])

.controller('DashboardCtrl', [function() {

}]);