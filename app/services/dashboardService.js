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

        var baseUrl = $location.protocol() + "://" + $location.host() + "/api";
        console.log($location.protocol() + "://" + $location.host() + "/api");
        var service = this;
        service.successfulTemples = 0;

        // Local Variables used in this service
        var templeDetailsArray = [];
        var allTemples = [];
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var currentdate = new Date();
        var currentMonth = currentdate.getMonth();
        // Here Current Year is 2017. Remove "- 1" from the end when you'll have 2018 data
        service.currentYear = currentdate.getFullYear() - 1;
        // Here Previous Year is 2016. Change "- 2" from the end to "- 1" when you'll have 2018 data
        service.previousYear = currentdate.getFullYear() - 2;


        // Gets Temple Details for Dashboard View
        service.getTempleDetails = function() {
            var deferred = $q.defer();
            var details = {};

            $http.get(baseUrl + '/dashboard').then(function(response) {
                var currentYearGoal = 0; // for 2018 Goal
                var currentYearYTDRem = 0; // for 2018 YTD Remittance
                var goalPercentage = 0; // for Percentage of Goal

                angular.forEach(response.data, function(value, key) {
                    if (value.currentMonth.length > 0) {
                        for (var i in value) {
                            details = {
                                "temple": key,
                                "yearlyGoal": value.goal,
                                "yearlyRemittance": value.ytd,
                                "remittanceProgress": value.ytd / value.goal * 100,
                                "currentRemittance": value.currentMonth[0].Remittance,
                                "monthlyGoal": value.goal / 12,
                                "country": value.currentMonth[0].Country,
                                "latitude": value.currentMonth[0].Lat,
                                "longitude": value.currentMonth[0].Lng
                            };
                        }
                        templeDetailsArray.push(details);
                        currentYearGoal = parseInt(value.goal) + currentYearGoal;
                        currentYearYTDRem = parseInt(value.ytd) + currentYearYTDRem;
                    } else {
                        templeDetailsArray = [];
                        currentYearGoal = 0;
                        currentYearYTDRem = 0;
                    }
                });

                deferred.resolve(templeDetailsArray);
                if (currentYearYTDRem > 0 && currentYearGoal > 0) {
                    goalPercentage = (currentYearYTDRem / currentYearGoal) * 100;
                } else {
                    goalPercentage = 0;
                }
                // Storing variables in Local Storage for better app speed
                $localStorage.currentYearYTDRemmittance = currentYearYTDRem;
                $localStorage.currentYearGoal = currentYearGoal;
                $localStorage.goalPercentage = goalPercentage;
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
                    var filteredUniqueTemplesData = [];
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

                    filteredUniqueTemplesData.push($filter('unique')(response.data.data, 'Temple'));
                    angular.forEach(filteredUniqueTemplesData, function(value, key) {
                        for (var i = 0; i < value.length; i++) {
                            allTemples.push(value[i].Temple);
                            if (value[i].Remittance > 0) {
                                uniqueTemples++;
                            }
                        }
                    });
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
                        "previousYearMonthlyRem": prevYearRem,
                        "allTemples": allTemples
                    };
                    service.getSuccessfulTemples();
                    deferred.resolve(details);
                });
            return deferred.promise;
        };

        // Gets Number of Temples who have met their Goal 
        service.getSuccessfulTemples = function() {
            var deferred = $q.defer();

            if (allTemples.length > 0) {
                for (var i = 0; i < allTemples.length; i++) {
                    $http.get(baseUrl + '/remittances/year/' + service.currentYear + '/' + allTemples[i]).then(function(response) {
                        var count = false;
                        var currRem = 0;
                        angular.forEach(response.data.data, function(value, key) {
                            var temp = value.Remittance;
                            currRem = parseInt(temp.toString().replace(/,/g, ''));
                            if (currRem >= response.data.sum) {
                                count = true;
                                return;
                            } else {
                                count = false;
                            }
                            if (count == true) {
                                service.successfulTemples++;
                            }
                        });
                    });
                }
                deferred.resolve(service.successfulTemples);
            }
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
                    if (monthlyRem.length > 0) {
                        for (var i = 0; i < templeDetailsArray.length; i++) {
                            if (monthlyRem[i].temple === templeDetailsArray[i].temple) {
                                templeDetailsArray[i].currentRemittance = monthlyRem[i].currentRemittance;
                            } else {
                                var index = -1;
                                templeDetailsArray.some(function(obj, j) {
                                    return obj.temple === monthlyRem[i].temple ? index = j : false;
                                });
                                templeDetailsArray[index].currentRemittance = monthlyRem[i].currentRemittance;
                            }
                        }
                        templesArray = templeDetailsArray;
                    } else {
                        templesArray = 0;
                    }
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
            // return $http.get(baseUrl + '/remittances/' + year + '/' + month + '/' + $localStorage.templeDetail.temple);

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

            $http.get(baseUrl + '/remittances/temple/' + $localStorage.templeDetail.temple).then(function(response) {
                var remToBreakRecord = response.data.max - $localStorage.templeDetail.currentRemittance;
                deferred.resolve(remToBreakRecord);
            });
            return deferred.promise;
        };
    }

    return new dashboardService();
})