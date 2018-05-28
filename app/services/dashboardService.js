'use strict';

angular.module('myApp.dashboard.service', [
    'ngRoute',
    'ngStorage',
    'myApp.dashboard',
    'myApp.dashboard.temple'
])

.factory('dashboardService', function($rootScope, $http, $q, $localStorage, $location) {

    function dashboardService() {

        var baseUrl = 'http://localhost:8080/api';
        var service = this;

        // Local Variables for Handling Data


        // Gets Temple Details for Dashboard View
        service.getTempleDetails = function() {
            var deferred = $q.defer();
            var details = {};
            var templesArray = [];
            $http.get(baseUrl + '/dashboard').then(function(response) {
                angular.forEach(response.data, function(value, key) {
                    for (var i in value) {
                        details = {
                            "temple": key,
                            "yearlyGoal": value.goal,
                            "yearlyRemittance": value.ytd,
                            "remittanceProgress": value.ytd / value.goal * 100,
                            "currentRemittance": value.currentMonth[0].Remittance,
                            "monthlyGoal": value.goal / 12,
                            "latitude": value.currentMonth[0].Lat,
                            "longitude": value.currentMonth[0].Lng
                        };
                    }
                    templesArray.push(details);
                });
                deferred.resolve(templesArray);
            });
            return deferred.promise;
        };

        // Gets Month-wise Remittances for a specific Year for Dashboard View
        service.getMonthlyRemittance = function(month, year) {
            return $http.get(baseUrl + '/remittances/' + year + '/' + month);
        };

        // Opens Specific Temple View when a table-row is clicked in the Dashboard View
        service.openTempleDetails = function(templeDetail) {
            $localStorage.templeDetail = templeDetail;
            $location.path('/temple');
        };

        // Gets Remittance History for a specific Temple from Current Month for Temple View
        service.getTempleRemittanceHistory = function() {
            return $http.get(baseUrl + '/remittances/history?months=10&location=' + $localStorage.templeDetail.temple);
        };

        // Gets Month-wise Remittances for a specific Temple in a specific Year for Temple View
        service.getTempleMonthlyRemittance = function(month, year) {
            return $http.get(baseUrl + '/remittances/' + year + '/' + month + '/' + $localStorage.templeDetail.temple);
        };
    }

    return new dashboardService();
})