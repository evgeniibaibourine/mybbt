'use strict';

angular.module('myApp.dashboard.service', [
    'ngRoute',
    'ngStorage',
    'angular.filter',
    'myApp.dashboard',
    'myApp.dashboard.temple'
])

.factory('dashboardService', function($rootScope, $http, $q, $localStorage, $location, $filter) {

    function dashboardService() {

        var baseUrl = "";
        if ($location.host() == "localhost") {
            baseUrl = $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/api";
        } else {
            baseUrl = $location.protocol() + "://" + $location.host() + "/api";
        }
        var service = this;

        // Local Variables used in this service
        var templeDetailsArray = [];
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var currentdate = new Date();
        var currentMonth = currentdate.getMonth();
        // Here Current Year is 2017. Remove "- 1" from the end when you'll have 2018 data
        service.currentYear = currentdate.getFullYear();
        // Here Previous Year is 2016. Change "- 2" from the end to "- 1" when you'll have 2018 data
        service.previousYear = currentdate.getFullYear() - 1;


        // Gets Temple Details for Dashboard View
        service.getTempleDetails = function() {
            var deferred = $q.defer();
            var details = {};

            $http.get(baseUrl + '/dashboard').then(function(response) {
                var currentYearGoal = 0; // for 2018 Goal
                var currentYearYTDRem = 0; // for 2018 YTD Remittance
                var goalPercentage = 0; // for Percentage of Goal
                var successfulTemples = 0; // for Number of Successful Temples

                angular.forEach(response.data, function(value, key) {
                    if (parseInt(value.goal) > 0 && value.ytd > 0) {
                        if (value.currentMonth.length > 0) {
                            details = {
                                "temple": key,
                                "yearlyGoal": value.goal,
                                "yearlyRemittance": value.ytd,
                                "remittanceProgress": (value.ytd / value.goal * 100).toFixed(2),
                                "monthlyGoal": (value.goal / 12).toFixed(2),
                                "currentRemittance": value.currentMonth[0].Remittance,
                                "country": value.currentMonth[0].Country,
                                "latitude": value.currentMonth[0].Lat,
                                "longitude": value.currentMonth[0].Lng
                            };
                        } else {
                            details = {
                                "temple": key,
                                "yearlyGoal": value.goal,
                                "yearlyRemittance": value.ytd,
                                "remittanceProgress": (value.ytd / value.goal * 100).toFixed(2),
                                "monthlyGoal": (value.goal / 12).toFixed(2),
                                "currentRemittance": "N/A",
                                "country": 'N/A',
                                "latitude": 0,
                                "longitude": 0
                            };
                        }
                        templeDetailsArray.push(details);
                        currentYearGoal = parseInt(value.goal) + currentYearGoal;
                        currentYearYTDRem = parseInt(value.ytd) + currentYearYTDRem;
                        if (parseInt(value.ytd) >= parseInt(value.goal)) {
                            successfulTemples++;
                        }
                    }
                });

                deferred.resolve(templeDetailsArray);
                goalPercentage = (currentYearYTDRem / currentYearGoal) * 100;

                // Storing variables in Local Storage for better app speed
                $localStorage.currentYearYTDRemmittance = currentYearYTDRem;
                $localStorage.currentYearGoal = currentYearGoal;
                $localStorage.goalPercentage = goalPercentage;
                $localStorage.successfulTemples = successfulTemples;
            });
            return deferred.promise;
        };

        // Gets Remittance Details in a specific Year 
        service.getYearlyRemittance = function() {
            var deferred = $q.defer();
            var details = {};
            var currYearRem = [];
            var prevYearRem = [];
            var uniqueTemples = 0;
            var total2018YTDRem = 0;

            $http.get(baseUrl + '/remittances/year/' + service.currentYear).then(function(response) {

                    var remCount = 0;
                    var temp = 0;
                    var matchFound = false;
                    var filteredMonthWiseData = [];
                    var filteredTemplesSubmittedRem = [];
                    var uniqueTempleDetails = {};
                    var templesSubmittedRem = [];

                    filteredMonthWiseData.push($filter('groupBy')(response.data.data, 'Month'));
                    angular.forEach(filteredMonthWiseData, function(value, key) {
                        angular.forEach(value, function(item, itemKey) {
                            if (itemKey === months[currentMonth]) {
                                matchFound = true;
                            } else {
                                if (matchFound != true) {
                                    for (var k = 0; k < item.length; k++) {
                                        temp = parseInt(item[k].Remittance.toString().replace(/,/g, ''));
                                        remCount = temp + remCount;
                                        if (temp > 0) {
                                            uniqueTempleDetails = {
                                                "temple": item[k].Temple,
                                                "remittance": temp,
                                                "month": item[k].Month
                                            };
                                            templesSubmittedRem.push(uniqueTempleDetails);
                                        }
                                    }
                                    currYearRem.push(remCount);
                                    remCount = 0;
                                }
                            }
                        });
                    });

                    filteredTemplesSubmittedRem.push($filter('unique')(templesSubmittedRem, 'temple'));
                    uniqueTemples = filteredTemplesSubmittedRem[0].length;

                    total2018YTDRem = response.data.sum;
                    return $http.get(baseUrl + '/remittances/year/' + service.previousYear);
                })
                .then(function(response) {
                    var remCount = 0;
                    var temp = 0;
                    var filteredMonthWiseData = [];

                    filteredMonthWiseData.push($filter('groupBy')(response.data.data, 'Month'));
                    angular.forEach(filteredMonthWiseData, function(value, key) {
                        angular.forEach(value, function(item, itemKey) {
                            for (var k = 0; k < item.length; k++) {
                                temp = parseInt(item[k].Remittance.toString().replace(/,/g, ''));
                                remCount = temp + remCount;
                            }
                            prevYearRem.push(remCount);
                            remCount = 0;
                        });
                    });
                    details = {
                        "sum": total2018YTDRem,
                        "uniqueTemples": uniqueTemples,
                        "currentYearMonthlyRem": currYearRem,
                        "previousYearMonthlyRem": prevYearRem
                    };
                    deferred.resolve(details);
                });
            return deferred.promise;
        };

        // Gets Temple Remittances for a specific Month for Datatable Month Switcher in Dashboard View
        service.getMonthlyTempleRemittances = function(month) {
            var deferred = $q.defer();
            var details = {};
            var templesArray = [];

            $http.get(baseUrl + '/remittances/' + service.currentYear + '/' + month).then(function(response) {

                var monthlyRem = [];

                angular.forEach(response.data.data, function(value, key) {
                    details = {
                        "temple": value.Temple,
                        "currentRemittance": value.Remittance
                    };
                    monthlyRem.push(details);
                });

                if (templeDetailsArray.length > 0) {
                    for (var i = 0; i < templeDetailsArray.length; i++) {
                        if (monthlyRem.length > 0) {
                            if (monthlyRem[i].temple === templeDetailsArray[i].temple) {
                                templeDetailsArray[i].currentRemittance = monthlyRem[i].currentRemittance;
                            } else {
                                var index = -1;
                                templeDetailsArray.some(function(obj, j) {
                                    return obj.temple === monthlyRem[i].temple ? index = j : false;
                                });
                                if (index >= 0) {
                                    templeDetailsArray[index].currentRemittance = monthlyRem[i].currentRemittance;
                                }
                            }
                        } else {
                            templeDetailsArray[i].currentRemittance = "N/A";
                        }
                    }
                    templesArray = templeDetailsArray;
                }
                deferred.resolve(templesArray);
            });
            return deferred.promise;
        };

        // Opens Specific Temple View when a table-row is clicked in the Dashboard View
        service.openTempleDetails = function(templeDetail) {
            $localStorage.templeDetail = templeDetail;
            $location.path('/temple');
        };

        // Gets Remittance History for a specific Temple from Current Month for Temple View
        service.getTempleRemittanceHistory = function() {
            var deferred = $q.defer();
            var details = {};
            var templeHistoryMonths = [];
            var templeHistoryRemittances = [];
            var templeRemHistory = [];

            $http.get(baseUrl + '/remittances/history?months=6&location=' + $localStorage.templeDetail.temple).then(function(response) {

                for (var i = 6; i >= 1; i--) {
                    templeHistoryMonths.push(moment().subtract(i, "month").startOf("month").format('MMMM'));
                }

                for (var j = 0; j < 6; j++) {
                    if (response.data.data[j]) {
                        templeHistoryRemittances.push(parseInt(response.data.data[j].Remittance.toString().replace(/,/g, '')));
                    } else {
                        templeHistoryRemittances.push(0);
                    }
                }

                details = {
                    "templeHistoryMonths": templeHistoryMonths,
                    "templeHistoryRemittances": templeHistoryRemittances
                };

                templeRemHistory.push(details);
                deferred.resolve(templeRemHistory);
            });
            return deferred.promise;
        };

        // Gets Month-wise Remittances for a specific Temple in a specific Year for Temple View
        service.getYearlyRemittanceOfSpecificTemple = function() {

            var deferred = $q.defer();
            var details = {};
            var currYearRem = [];
            var prevYearRem = [];

            $http.get(baseUrl + '/remittances/year/' + service.currentYear + '/' + $localStorage.templeDetail.temple).then(function(response) {

                    var remCount = 0;
                    var temp = 0;
                    var matchFound = false;
                    var filteredMonthWiseData = [];

                    filteredMonthWiseData.push($filter('groupBy')(response.data.data, 'Month'));
                    angular.forEach(filteredMonthWiseData, function(value, key) {
                        angular.forEach(value, function(item, itemKey) {
                            if (itemKey === months[currentMonth]) {
                                matchFound = true;
                            } else {
                                if (matchFound != true) {
                                    for (var k = 0; k < item.length; k++) {
                                        temp = parseInt(item[k].Remittance.toString().replace(/,/g, ''));
                                        remCount = temp + remCount;
                                    }
                                    currYearRem.push(remCount);
                                    remCount = 0;
                                }
                            }
                        });
                    });
                    return $http.get(baseUrl + '/remittances/year/' + service.previousYear + '/' + $localStorage.templeDetail.temple);
                })
                .then(function(response) {
                    var remCount = 0;
                    var temp = 0;
                    var filteredMonthWiseData = [];

                    filteredMonthWiseData.push($filter('groupBy')(response.data.data, 'Month'));
                    angular.forEach(filteredMonthWiseData, function(value, key) {
                        angular.forEach(value, function(item, itemKey) {
                            for (var k = 0; k < item.length; k++) {
                                temp = parseInt(item[k].Remittance.toString().replace(/,/g, ''));
                                remCount = temp + remCount;
                            }
                            prevYearRem.push(remCount);
                            remCount = 0;
                        });
                    });
                    details = {
                        "currentYearMonthlyRem": currYearRem,
                        "previousYearMonthlyRem": prevYearRem
                    };
                    deferred.resolve(details);
                });
            return deferred.promise;
        };

        // Gets Number of Remittances to Break a Record for a Temple for Temple View
        service.getRemToBreakRecord = function() {
            var deferred = $q.defer();
            var remToBreakRecord = 0;

            $http.get(baseUrl + '/remittances/temple/' + $localStorage.templeDetail.temple).then(function(response) {
                if ($localStorage.templeDetail.currentRemittance != "N/A") {
                    remToBreakRecord = response.data.max - $localStorage.templeDetail.currentRemittance;
                } else {
                    remToBreakRecord = response.data.max;
                }
                deferred.resolve(remToBreakRecord);
            });
            return deferred.promise;
        };
    }

    return new dashboardService();
})