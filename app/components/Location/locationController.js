'use strict';

angular.module('myApp.location', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/location', {
        templateUrl: 'app/components/Location/locationView.html',
        controller: 'LocationCtrl'
    });
}])

.controller('LocationCtrl', [function() {

}]);