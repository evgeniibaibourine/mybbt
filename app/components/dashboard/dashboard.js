'use strict';

angular.module('myApp.dashboard', [
    'ngRoute',
    'myApp.dashboard.location'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/dashboard', {
        templateUrl: 'components/dashboard/dashboard.html',
        controller: 'DashboardCtrl'
    });
}])

.controller('DashboardCtrl', [function() {

}]);