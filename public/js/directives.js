/**
 * Created by tailor on 8/28/2014.
 */
angular.module('hdxadmin.directive', [])
    .directive('appVersion',
    [
        'version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }])
    .directive('accountHeader',
    [
        '$rootScope','$location','ticketsCache',function($rootScope,$location,ticketsCache){
        return {
            restrict:'E',
            replace:true,
            controller:'HeaderCtrl',
            templateUrl:'partials/directives/account-header.html',
            link:function($scope,element,attrs){

            }
        };
    }]);

