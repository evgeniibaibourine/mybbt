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
    $scope.remToBreakRecord = 0;

    var totalGoal = $localStorage.currentYearGoal;
    var templeHistory = [];
    var yearlyRemittanceOfTemple = {};


    service.getRemToBreakRecord().then(function(response) {
        $scope.remToBreakRecord = response;
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

    // Pie Chart Starts Here
    $scope.pieLabels = [service.currentYear + " YTD Remittance", service.currentYear + " Goal"];
    $scope.pieColors = [{
        backgroundColor: '#f88451',
        pointBackgroundColor: '#f88451',
        pointHoverBackgroundColor: '#f88451',
        borderColor: '#f88451',
        pointBorderColor: '#f88451',
        pointHoverBorderColor: '#f88451'
    }, {
        backgroundColor: '#78ead3',
        pointBackgroundColor: '#78ead3',
        pointHoverBackgroundColor: '#78ead3',
        borderColor: '#78ead3',
        pointBorderColor: '#fff',
        pointHoverBorderColor: '#78ead3'
    }];
    $scope.pieData = [$scope.ytdRemittance, totalGoal];
    $scope.pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: true, position: 'bottom' }
    };
    // Pie Chart Ends Here

    // Bar Chart Starts Here
    service.getTempleRemittanceHistory().then(function(response) {
        templeHistory = response;

        $scope.constructBarChart();
    });

    $scope.constructBarChart = function() {

        $scope.barLabels = templeHistory[0].templeHistoryMonths;
        $scope.barSeries = [$scope.templeName];
        $scope.barColors = [{
                backgroundColor: '#00805d',
                pointBackgroundColor: '#00805d',
                pointHoverBackgroundColor: '#00805d',
                borderColor: '#00805d',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#00805d'
            },
            {
                backgroundColor: '#f88451',
                pointBackgroundColor: '#f88451',
                pointHoverBackgroundColor: '#f88451',
                borderColor: '#f88451',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#f88451'
            },
            {
                backgroundColor: '#78ead3',
                pointBackgroundColor: '#78ead3',
                pointHoverBackgroundColor: '#78ead3',
                borderColor: '#78ead3',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#78ead3'
            },
            {
                backgroundColor: '#dd0d03',
                pointBackgroundColor: '#dd0d03',
                pointHoverBackgroundColor: '#dd0d03',
                borderColor: '#dd0d03',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#dd0d03'
            },
            {
                backgroundColor: '#36cae8',
                pointBackgroundColor: '#36cae8',
                pointHoverBackgroundColor: '#36cae8',
                borderColor: '#36cae8',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#36cae8'
            },
            {
                backgroundColor: '#e3e8d2',
                pointBackgroundColor: '#e3e8d2',
                pointHoverBackgroundColor: '#e3e8d2',
                borderColor: '#e3e8d2',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#e3e8d2'
            }
        ];
        $scope.barData = templeHistory[0].templeHistoryRemittances;
        $scope.barOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: false }
        };
    };
    // Bar Chart Ends Here

    // Line Chart Starts Here
    service.getYearlyRemittanceOfSpecificTemple().then(function(response) {
        yearlyRemittanceOfTemple = response;

        $scope.constructLineChart();
    });

    $scope.constructLineChart = function() {
        $scope.lineLabels = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
        $scope.lineSeries = [service.currentYear, service.previousYear];
        $scope.lineColors = ['#dd0d03', '#36cae8', '#3498DB', '#72C02C'];
        $scope.lineData = [yearlyRemittanceOfTemple.currentYearMonthlyRem, yearlyRemittanceOfTemple.previousYearMonthlyRem];
        $scope.lineOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: true, position: 'bottom' }
        };
    };
    // Line Chart Ends Here

    // Google Maps Code Starts From Here
    // Temple Data
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
    // Google Maps Code Ends Here

}]);