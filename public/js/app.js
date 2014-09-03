var dependencies = ['hdxadmin.directive', 'hdxadmin.filters', 'hdxadmin.services', 'hdxadmin.controllers','LocalStorageModule','ui'];

var app = app || angular.module('hdxadmin', dependencies);

app.config([
    '$routeProvider', '$locationProvider', '$httpProvider',
    function ($routeProvider, $locationProvider, $httpProvider) {
        $routeProvider
            .when('/notifications', {
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
            })
            .when('/login', {
                templateUrl: 'partials/login.html',
                controller: 'LoginCtrl',
                title: 'Login'
            });

        var interceptor = ['$rootScope', '$q', '$location', function (rootScope, $q, $location)
        {
            function success(response)
            {
                return response;
            }
            function error(response)
            {
                var status = response.status;
                if (status == 401)
                {
                    var deferred = $q.defer();
                    $location.path('/login');
                    return deferred.promise;
                }
                // otherwise
                return $q.reject(response);
            }
            return function (promise)
            {
                return promise.then(success, error);
            }
        }];
        $httpProvider.responseInterceptors.push(interceptor);


    }]);

function showMainLoader(){
    $('#content_wait_spinner').show();
}
function hideMainLoader(){
    $('#content_wait_spinner').hide();
}