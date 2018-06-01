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
    var totalGoal = $localStorage.currentYearGoal;
    var currentdate = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var templeHistory = [];
    var templeHistoryMonths = [];
    var templeHistoryRemittances = [];
    var currentYearMonthlyRem = [];
    var prevYearMonthlyRem = [];

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
    $scope.pieLabels = ["2018 YTD Remittance", "2018 Goal"];
    $scope.pieColors = [{
        backgroundColor: '#b4bfbf',
        pointBackgroundColor: '#b4bfbf',
        pointHoverBackgroundColor: '#b4bfbf',
        borderColor: '#b4bfbf',
        pointBorderColor: '#fff',
        pointHoverBorderColor: '#b4bfbf'
    }, {
        backgroundColor: '#f1d7b9',
        pointBackgroundColor: '#f1d7b9',
        pointHoverBackgroundColor: '#f1d7b9',
        borderColor: '#f1d7b9',
        pointBorderColor: '#fff',
        pointHoverBorderColor: '#f1d7b9'
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
                backgroundColor: '#dbd5c5',
                pointBackgroundColor: '#dbd5c5',
                pointHoverBackgroundColor: '#dbd5c5',
                borderColor: '#dbd5c5',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#dbd5c5'
            },
            {
                backgroundColor: '#798e93',
                pointBackgroundColor: '#798e93',
                pointHoverBackgroundColor: '#798e93',
                borderColor: '#798e93',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#798e93'
            },
            {
                backgroundColor: '#f1d7b9',
                pointBackgroundColor: '#f1d7b9',
                pointHoverBackgroundColor: '#f1d7b9',
                borderColor: '#f1d7b9',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#f1d7b9'
            },
            {
                backgroundColor: '#b4bfbf',
                pointBackgroundColor: '#b4bfbf',
                pointHoverBackgroundColor: '#b4bfbf',
                borderColor: '#b4bfbf',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#b4bfbf'
            },
            {
                backgroundColor: '#ebdf92',
                pointBackgroundColor: '#ebdf92',
                pointHoverBackgroundColor: '#ebdf92',
                borderColor: '#ebdf92',
                pointBorderColor: '#fff',
                pointHoverBorderColor: '#ebdf92'
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

        service.getMonthlyRemittanceOfTemple(months[i], currentdate.getFullYear() - 1).then(function(response) {
            currentYearMonthlyRem.push(response.data.sum);
        });

        service.getMonthlyRemittanceOfTemple(months[i], currentdate.getFullYear() - 2).then(function(response) {
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