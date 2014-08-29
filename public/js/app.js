var dependencies = ['hdxadmin.directive', 'hdxadmin.filters', 'hdxadmin.services', 'hdxadmin.controllers','LocalStorageModule','ui'];

var app = app || angular.module('hdxadmin', dependencies);

app.config([
    '$routeProvider', '$locationProvider', '$httpProvider',
    function ($routeProvider, $locationProvider, $httpProvider) {
        $routeProvider
            .when('/notification', {
                templateUrl: 'partials/notification.html',
                controller: 'NotificationCtrl',
                title: 'Notification'
            })
            .otherwise({
                controller:'RedirectCtrl'
            });
    }]);