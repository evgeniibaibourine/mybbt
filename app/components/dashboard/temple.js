'use strict';

angular.module('myApp.dashboard.temple', [
    'ngRoute',
    '720kb.tooltips',
    'ngStorage',
    'myApp.dashboard.service'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/temple', {
        templateUrl: 'components/dashboard/temple.html',
        controller: 'TempleCtrl'
    });
}])

.controller('TempleCtrl', ['$scope', 'dashboardService', '$window', '$localStorage', function($scope, service, $window, $localStorage) {

    // For Displaying the Name and Progress of the Temple in the Temple View
    $scope.templeName = $localStorage.templeDetail.temple;
    $scope.ytdRemittance = $localStorage.templeDetail.yearlyRemittance;
    $scope.remProgress = $localStorage.templeDetail.remittanceProgress;

    var templeDetails = [];
    var totalGoal = 0;
    var currentdate = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var templeHistory = [];
    var templeHistoryMonths = [];
    var templeHistoryRemittances = [];
    var currentYearMonthlyRem = [];
    var prevYearMonthlyRem = [];

    service.getTempleDetails().then(function(response) {
        templeDetails = response;

        // Total 2018 Goal
        angular.forEach(templeDetails, function(value, key) {
            totalGoal = parseInt(value.yearlyGoal) + totalGoal;
        });

        $scope.constructPieChart();
        $scope.generateTempleMap();
    });

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

    // Pie Chart Starts Here
    $scope.constructPieChart = function() {
        $scope.pieLabels = ["2018 YTD Remittance", "2018 Goal"];
        $scope.pieColors = [{
            backgroundColor: '#27c24c',
            pointBackgroundColor: '#27c24c',
            pointHoverBackgroundColor: '#27c24c',
            borderColor: '#27c24c',
            pointBorderColor: '#fff',
            pointHoverBorderColor: '#27c24c'
        }, {
            backgroundColor: '#f05050',
            pointBackgroundColor: '#f05050',
            pointHoverBackgroundColor: '#f05050',
            borderColor: '#f05050',
            pointBorderColor: '#fff',
            pointHoverBorderColor: '#f05050'
        }];
        $scope.pieData = [$scope.ytdRemittance, totalGoal];
        $scope.pieOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: true, position: 'bottom' }
        };
    };
    // Pie Chart Ends Here

    // Bar Chart Starts Here
    service.getTempleRemittanceHistory().then(function(response) {
        templeHistory = response.data;

        angular.forEach(templeHistory, function(value, key) {
            angular.forEach(value, function(item) {
                if (item.Month && item.Remittance) {
                    templeHistoryMonths.push(item.Month);
                    templeHistoryRemittances.push(parseInt(item.Remittance));
                }
            });
        });

        $scope.constructBarChart();
    });

    $scope.constructBarChart = function() {

        $scope.barLabels = templeHistoryMonths;
        $scope.barSeries = [$scope.templeName];
        $scope.barColors = [{
                backgroundColor: '#F1C40F',
                pointBackgroundColor: '#F1C40F',
                pointHoverBackgroundColor: '#F1C40F',
                borderColor: '#F1C40F',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#F1C40F'
            },
            {
                backgroundColor: '#3a3f51',
                pointBackgroundColor: '#3a3f51',
                pointHoverBackgroundColor: '#3a3f51',
                borderColor: '#3a3f51',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#3a3f51'
            },
            {
                backgroundColor: '#ec2121',
                pointBackgroundColor: '#ec2121',
                pointHoverBackgroundColor: '#ec2121',
                borderColor: '#ec2121',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#ec2121'
            },
            {
                backgroundColor: '#27c24c',
                pointBackgroundColor: '#27c24c',
                pointHoverBackgroundColor: '#27c24c',
                borderColor: '#27c24c',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#27c24c'
            },
            {
                backgroundColor: '#e90bd6',
                pointBackgroundColor: '#e90bd6',
                pointHoverBackgroundColor: '#e90bd6',
                borderColor: '#e90bd6',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#e90bd6'
            },
            {
                backgroundColor: '#2ed6e5',
                pointBackgroundColor: '#2ed6e5',
                pointHoverBackgroundColor: '#2ed6e5',
                borderColor: '#2ed6e5',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#2ed6e5'
            }
        ];
        $scope.barData = templeHistoryRemittances;
        $scope.barOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: false }
        };
    };
    // Bar Chart Ends Here

    // Line Chart Starts Here
    $scope.lineLabels = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (var i = 0; i < months.length; i++) {

        service.getTempleMonthlyRemittance(months[i], currentdate.getFullYear() - 1).then(function(response) {
            currentYearMonthlyRem.push(response.data.sum);
        });

        service.getTempleMonthlyRemittance(months[i], currentdate.getFullYear() - 2).then(function(response) {
            prevYearMonthlyRem.push(response.data.sum);
        });
    }

    $scope.lineSeries = ['2017', '2018'];
    $scope.lineColors = ['#F1C40F', '#717984', '#3498DB', '#72C02C'];
    $scope.lineData = [prevYearMonthlyRem, currentYearMonthlyRem];
    $scope.lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: true, position: 'bottom' }
    };
    // Line Chart Ends Here

    // Google Maps Code Starts From Here
    $scope.generateTempleMap = function() {
        //Data
        var templeData = {
            temple: $scope.templeName,
            lat: $localStorage.templeDetail.latitude,
            long: $localStorage.templeDetail.longitude
        };

        var mapOptions = {
            zoom: 4,
            center: new google.maps.LatLng($localStorage.templeDetail.latitude, $localStorage.templeDetail.longitude),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

        $scope.markers = [];

        var infoWindow = new google.maps.InfoWindow();

        var createMarker = function(info) {

            var marker = new google.maps.Marker({
                map: $scope.map,
                position: new google.maps.LatLng(info.lat, info.long),
                title: info.temple
            });
            marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';

            google.maps.event.addListener(marker, 'click', function() {
                infoWindow.setContent('<h5>' + marker.title + '</h5>');
                infoWindow.open($scope.map, marker);
            });

            $scope.markers.push(marker);

        }

        createMarker(templeData);

        $scope.openInfoWindow = function(e, selectedMarker) {
            e.preventDefault();
            google.maps.event.trigger(selectedMarker, 'click');
        };
    };
    // Google Maps Code Ends Here

}]);