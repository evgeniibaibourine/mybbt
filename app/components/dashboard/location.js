'use strict';

angular.module('myApp.dashboard.location', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/location', {
        templateUrl: 'components/dashboard/location.html',
        controller: 'LocationCtrl'
    });
}])

.controller('LocationCtrl', [function() {

}]);