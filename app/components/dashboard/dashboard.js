'use strict';

angular.module('myApp.dashboard', [
    'ngRoute',
    '720kb.tooltips',
    'datatables',
    'chart.js',
    'myApp.dashboard.service'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/dashboard', {
        templateUrl: 'components/dashboard/dashboard.html',
        controller: 'DashboardCtrl'
    });
}])

.directive('usaRemittanceMap', function() {
    return {
        restrict: 'E',
        replace: true,
        template: '<div id="chartdiv"></div>',
        scope: {
            templeDetails: '=model'
        },
        link: function(scope, element, attrs) {

            var chart = false;
            var areas = [{
                "id": "US-AL"
            }, {
                "id": "US-AK"
            }, {
                "id": "US-AZ"
            }, {
                "id": "US-AR"
            }, {
                "id": "US-CA"
            }, {
                "id": "US-CO"
            }, {
                "id": "US-CT"
            }, {
                "id": "US-DE"
            }, {
                "id": "US-FL"
            }, {
                "id": "US-GA"
            }, {
                "id": "US-HI"
            }, {
                "id": "US-ID"
            }, {
                "id": "US-IL"
            }, {
                "id": "US-IN"
            }, {
                "id": "US-IA"
            }, {
                "id": "US-KS"
            }, {
                "id": "US-KY"
            }, {
                "id": "US-LA"
            }, {
                "id": "US-ME"
            }, {
                "id": "US-MD"
            }, {
                "id": "US-MA"
            }, {
                "id": "US-MI"
            }, {
                "id": "US-MN"
            }, {
                "id": "US-MS"
            }, {
                "id": "US-MO"
            }, {
                "id": "US-MT"
            }, {
                "id": "US-NE"
            }, {
                "id": "US-NV"
            }, {
                "id": "US-NH"
            }, {
                "id": "US-NJ"
            }, {
                "id": "US-NM"
            }, {
                "id": "US-NY"
            }, {
                "id": "US-NC"
            }, {
                "id": "US-ND"
            }, {
                "id": "US-OH"
            }, {
                "id": "US-OK"
            }, {
                "id": "US-OR"
            }, {
                "id": "US-PA"
            }, {
                "id": "US-RI"
            }, {
                "id": "US-SC"
            }, {
                "id": "US-SD"
            }, {
                "id": "US-TN"
            }, {
                "id": "US-TX"
            }, {
                "id": "US-UT"
            }, {
                "id": "US-VT"
            }, {
                "id": "US-VA"
            }, {
                "id": "US-WA"
            }, {
                "id": "US-WV"
            }, {
                "id": "US-WI"
            }, {
                "id": "US-WY"
            }];

            var latlong = {};
            var mapData = [];
            var details = {};
            // console.log(scope.templeDetails);

            scope.$watch('templeDetails', function(newData, oldData) {
                if (newData) {
                    for (var i = 0; i < scope.templeDetails.length; i++) {
                        if (scope.templeDetails[i].latitude !== "" && scope.templeDetails[i].country == "USA") {
                            if (scope.templeDetails[i].temple == "Calgary") {
                                latlong[scope.templeDetails[i].temple] = {
                                    "latitude": scope.templeDetails[i].latitude,
                                    "longitude": scope.templeDetails[i].longitude
                                };
                            } else if (scope.templeDetails[i].temple == "Honolulu") {
                                // Honolulu = {"latitude":23.3058,"longitude":-103.6485}
                                latlong[scope.templeDetails[i].temple] = {
                                    "latitude": 23.3058,
                                    "longitude": -103.6485
                                };
                            } else {
                                latlong[scope.templeDetails[i].temple] = {
                                    "latitude": scope.templeDetails[i].latitude,
                                    "longitude": scope.templeDetails[i].longitude
                                };
                            }

                            details = {
                                "code": scope.templeDetails[i].temple,
                                "name": scope.templeDetails[i].temple,
                                "value": scope.templeDetails[i].yearlyRemittance,
                                "color": "#798E94"
                            };

                            mapData.push(details);
                        }
                    }

                    // get min and max values
                    var minBulletSize = 8;
                    var maxBulletSize = 30;
                    var min = Infinity;
                    var max = -Infinity;
                    for (var i = 0; i < mapData.length; i++) {
                        var value = mapData[i].value;
                        if (value < min) {
                            min = value;
                        }
                        if (value > max) {
                            max = value;
                        }
                    }

                    // it's better to use circle square to show difference between values, not a radius
                    var maxSquare = maxBulletSize * maxBulletSize * 2 * Math.PI;
                    var minSquare = minBulletSize * minBulletSize * 2 * Math.PI;

                    // create circle for each temple
                    var images = [];
                    for (var i = 0; i < mapData.length; i++) {
                        var dataItem = mapData[i];
                        var value = dataItem.value;
                        // calculate size of a bubble
                        var square = (value - min) / (max - min) * (maxSquare - minSquare) + minSquare;
                        if (square < minSquare) {
                            square = minSquare;
                        }
                        var size = Math.sqrt(square / (Math.PI * 2));
                        var id = dataItem.code;

                        images.push({
                            "type": "circle",
                            "theme": "none",
                            "width": size,
                            "height": size,
                            "color": dataItem.color,
                            "longitude": latlong[id].longitude,
                            "latitude": latlong[id].latitude,
                            "title": dataItem.name,
                            "value": value
                        });
                    }

                    var initChart = function() {
                        if (chart) chart.destroy();
                        var config = scope.config || {};
                        chart = AmCharts.makeChart("chartdiv", {
                            type: "map",
                            theme: "light",
                            areasSettings: {
                                autoZoom: false,
                                color: "#dbd5c5",
                                rollOverColor: "#bdb9ae"
                            },
                            dataProvider: {
                                map: "usa2Low",
                                images: images,
                                areas: areas
                            },
                            export: {
                                enabled: false
                            }
                        });
                    }

                    if (scope.templeDetails.length > 0) {
                        initChart();
                    }
                }
            }, true);
        }
    }
})

.controller('DashboardCtrl', ['$scope', 'dashboardService', 'DTOptionsBuilder', '$localStorage', function($scope, service, DTOptionsBuilder, $localStorage) {

    // Temple Details Datatable Starts Here
    $scope.templeDetails = [];
    $scope.monthArray = [];
    $scope.selectedTempleDetailsMonth;
    $scope.remittanceDetails = {};
    $scope.goalPercentage = 0;
    $scope.successfulTemples = 0;

    var totalGoal = 0;
    var totalYTDRemittance = 0;
    var currentdate = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var currentMonth = currentdate.getMonth();

    for (var i = 0; i <= currentMonth; i++) {
        $scope.monthArray.push(months[i]);
    }

    $scope.monthSwitcher = function(month) {
        service.getMonthlyTempleRemittances(month).then(function(details) {
            $scope.templeDetails = details;
        });
    };

    // Datatable Options
    $scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('simple_numbers').withOption('responsive', true).withDOM('ftipr');

    service.getTempleDetails().then(function(details) {
        $scope.templeDetails = details;

        // Total 2018 Goal
        totalGoal = $localStorage.currentYearGoal;

        // 2018 Total YTD Remittance
        totalYTDRemittance = $localStorage.currentYearYTDRemmittance;

        // Current Year's Percentage of Goal
        $scope.goalPercentage = $localStorage.goalPercentage;

        $scope.constructPieChart();
    });

    // Method to Change ProgressBar colors depending upon the Percentage
    $scope.progressColor = function(value) {
        $scope.class;
        if (value < 20) {
            $scope.class = 'bg-danger';
        } else if (value >= 20 && value <= 80) {
            $scope.class = 'bg-yellow';
        } else if (value > 80) {
            $scope.class = 'bg-success';
        }
        return $scope.class;
    };

    $scope.openTempleDetails = function(detail) {
        service.openTempleDetails(detail);
    };
    // Temple Details Datatable Ends Here

    service.getYearlyRemittance().then(function(details) {
        $scope.remittanceDetails = details;

        $scope.constructLineChart();
    });

    service.getSuccessfulTemples().then(function(response) {
        $scope.successfulTemples = response;
    });

    // Pie Chart Starts Here
    $scope.constructPieChart = function() {
        $scope.pieLabels = ["2018 YTD Remittance", "2018 Goal"];
        $scope.pieColors = [{
            backgroundColor: '#f1d7b9',
            pointBackgroundColor: '#f1d7b9',
            pointHoverBackgroundColor: '#f1d7b9',
            borderColor: '#f1d7b9',
            pointBorderColor: '#fff',
            pointHoverBorderColor: '#f1d7b9'
        }, {
            backgroundColor: '#b4bfbf',
            pointBackgroundColor: '#b4bfbf',
            pointHoverBackgroundColor: '#b4bfbf',
            borderColor: '#b4bfbf',
            pointBorderColor: '#fff',
            pointHoverBorderColor: '#b4bfbf'
        }];
        $scope.pieData = [totalYTDRemittance, totalGoal];
        $scope.pieOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: true, position: 'bottom' }
        };
    };
    // Pie Chart Ends Here

    // Line Chart Starts Here
    $scope.constructLineChart = function() {
        $scope.lineLabels = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
        $scope.lineSeries = ['2018', '2017'];
        $scope.lineColors = ['#717984', '#F1C40F', '#3498DB', '#72C02C'];
        $scope.lineData = [$scope.remittanceDetails.currentYearMonthlyRem, $scope.remittanceDetails.previousYearMonthlyRem];
        $scope.lineOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: true, position: 'bottom' }
        };
    };
    // Line Chart Ends Here

}]);