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

.controller('DashboardCtrl', ['$scope', 'dashboardService', 'DTOptionsBuilder', function($scope, service, DTOptionsBuilder) {

    // Temple Details Datatable Starts Here
    $scope.templeDetails = [];
    $scope.monthArray = [];
    $scope.selectedTempleDetailsMonth;

    var totalGoal = 0;
    var totalYTDRemittance = 0;
    var currentdate = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var currentYearMonthlyRem = [];
    var prevYearMonthlyRem = [];
    var currentMonth = currentdate.getMonth();

    for (var i = 0; i <= currentMonth; i++) {
        $scope.monthArray.push(months[i]);
    }

    $scope.monthSwitcher = function(month) {
        service.getMonthlyRemittance(month, currentdate.getFullYear() - 1).then(function(response) {
            var monthlyRem = [];

            angular.forEach(response.data, function(value, key) {
                angular.forEach(value, function(item) {
                    monthlyRem.push(item.Remittance);
                });
            });

            for (var i = 0; i < $scope.templeDetails.length; i++) {
                $scope.templeDetails[i].currentRemittance = monthlyRem[i];
            }
        });
    };

    // Datatable Options
    $scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('simple_numbers').withDOM('ftipr');

    service.getTempleDetails().then(function(details) {
        $scope.templeDetails = details;

        // Total 2018 Goal
        angular.forEach($scope.templeDetails, function(value, key) {
            totalGoal = parseInt(value.yearlyGoal) + totalGoal;
        });

        // 2018 Total YTD Remittance
        angular.forEach($scope.templeDetails, function(value, key) {
            totalYTDRemittance = parseInt(value.yearlyRemittance) + totalYTDRemittance;
        });

        $scope.constructPieChart();
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

    $scope.openTempleDetails = function(detail) {
        service.openTempleDetails(detail);
    };
    // Temple Details Datatable Ends Here

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
        $scope.pieData = [totalYTDRemittance, totalGoal];
        $scope.pieOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: true, position: 'bottom' }
        };
    };
    // Pie Chart Ends Here

    // Line Chart Starts Here
    $scope.lineLabels = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (var i = 0; i < months.length; i++) {

        service.getMonthlyRemittance(months[i], currentdate.getFullYear() - 1).then(function(response) {
            currentYearMonthlyRem.push(response.data.sum);
        });

        service.getMonthlyRemittance(months[i], currentdate.getFullYear() - 2).then(function(response) {
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

}]);