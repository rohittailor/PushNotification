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
            .when('/groups', {
                templateUrl: 'partials/groups.html',
                controller: 'GroupsCtrl',
                title: 'Groups'
            })
            .when('/users', {
                templateUrl: 'partials/users.html',
                controller: 'UsersCtrl',
                title: 'Users'
            });


    }]);