'use strict';

angular.module('myApp.dashboard', [
    'ngRoute',
    '720kb.tooltips',
    'chart.js',
    'angular.filter',
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

            scope.$watch('templeDetails', function(newData, oldData) {
                if (newData && !oldData) {
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
                                "color": "#00805d"
                            };

                            mapData.push(details);
                        }
                    }

                    // get min and max values
                    var minBulletSize = 15;
                    var maxBulletSize = 35;
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

                        if (scope.templeDetails.length > 0) {
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
                        } else {
                            images = [];
                        }
                    }

                    var initChart = function() {
                        if (chart) chart.destroy();
                        var config = scope.config || {};
                        chart = AmCharts.makeChart("chartdiv", {
                            type: "map",
                            theme: "light",
                            areasSettings: {
                                autoZoom: false,
                                color: "#78ead3",
                                rollOverColor: "#36cae8"
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

                    initChart();
                }
            }, true);
        }
    }
})

.controller('DashboardCtrl', ['$scope', 'dashboardService', '$localStorage', '$filter', function($scope, service, $localStorage, $filter) {

    // Temple Details Datatable Starts Here
    $scope.templeDetails = [];
    $scope.monthArray = [];
    $scope.selectedTempleDetailsMonth;
    $scope.remittanceDetails = {};
    $scope.goalPercentage = 0;
    $scope.successfulTemples = 0;
    $scope.currentYear = service.currentYear;

    $scope.totalGoal = 0;
    $scope.totalYTDRemittance = 0;
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

    service.getTempleDetails().then(function(details) {
        $scope.templeDetails = details;

        // Total 2018 Goal
        $scope.totalGoal = $localStorage.currentYearGoal;

        // 2018 Total YTD Remittance
        $scope.totalYTDRemittance = $localStorage.currentYearYTDRemmittance;

        // Current Year's Percentage of Goal
        $scope.goalPercentage = $localStorage.goalPercentage;

        // Number of Successful Temples
        $scope.successfulTemples = $localStorage.successfulTemples;

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

        $scope.templeDetails = details.templesArray;

        $scope.constructLineChart();
    });

    // Pie Chart Starts Here
    $scope.constructPieChart = function() {
        $scope.pieLabels = [service.currentYear + " YTD Remittance", service.currentYear + " Goal"];
        $scope.pieColors = [{
            backgroundColor: '#00805d',
            pointBackgroundColor: '#00805d',
            pointHoverBackgroundColor: '#00805d',
            borderColor: '#00805d',
            pointBorderColor: '#fff',
            pointHoverBorderColor: '#00805d'
        }, {
            backgroundColor: '#f88451',
            pointBackgroundColor: '#f88451',
            pointHoverBackgroundColor: '#f88451',
            borderColor: '#f88451',
            pointBorderColor: '#fff',
            pointHoverBorderColor: '#f88451'
        }];
        $scope.pieData = [$scope.totalYTDRemittance, $scope.totalGoal];
        $scope.pieOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: true,
                position: 'bottom'
            },
            tooltips: {
                mode: 'label',
                callbacks: {
                    label: function(tooltipItem, data) {
                        return data.labels[tooltipItem.index] + ': $' + data['datasets'][0]['data'][tooltipItem['index']].toLocaleString();
                    }
                }
            }
        };
    };
    // Pie Chart Ends Here

    // Line Chart Starts Here
    $scope.constructLineChart = function() {
        $scope.lineLabels = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
        $scope.lineSeries = [service.currentYear, service.previousYear];
        $scope.lineColors = ['#dd0d03', '#36cae8', '#3498DB', '#72C02C'];
        $scope.lineData = [$scope.remittanceDetails.currentYearMonthlyRem, $scope.remittanceDetails.previousYearMonthlyRem];
        $scope.lineOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: true, position: 'bottom' },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function(value, index, values) {
                            if (parseInt(value) >= 0) {
                                return '$' + value.toLocaleString();
                            } else {
                                return '$' + value;
                            }
                        }
                    }
                }]
            },
            tooltips: {
                mode: 'label',
                callbacks: {
                    label: function(tooltipItem, data) {
                        return data.datasets[tooltipItem.datasetIndex].label + ': $' + tooltipItem.yLabel.toLocaleString();
                    }
                }
            }
        };
    };
    // Line Chart Ends Here

}]);