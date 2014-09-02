/**
 * Created by tailor on 8/28/2014.
 */
'use strict';
var transform = function (data)
{
    return $.param(data);
}

angular.module('hdxadmin.services', [])

    .value('version', '0.1')
    .factory('baseUrl',function(){
        return {
            getServiceUrl:function(){
                return serviceData.service_url;
            }
        }

    })
    .factory('socket',['$rootScope',function ($rootScope) {
        var socket = io.connect(pushServiceUrl);
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    }])
    .factory('AdminService', ['$http', 'baseUrl',function ($http, baseUrl) {

        var service = {};
        //load groups
        service.getGroups = function () {
            var serviceURL;
            serviceURL=baseUrl.getServiceUrl()+'/groups?accessToken='+SAW.session.accessToken;
            return $http({
                method:'GET',
                url:serviceURL
            })
        };
        //delete group
        service.deleteGroup= function (groupName) {
            var serviceURL;
            serviceURL=baseUrl.getServiceUrl()+'/groups/'+groupName+'?accessToken='+SAW.session.accessToken;
            return $http({
                method:'DELETE',
                url:serviceURL
            })
        };
        //add group
        service.addGroup= function (data) {
            var serviceURL;
            serviceURL=baseUrl.getServiceUrl()+'/groups?accessToken='+SAW.session.accessToken;
            return $http({
                method:'POST',
                url:serviceURL,
                headers:{
                    'Content-Type':'application/x-www-form-urlencoded'
                },
                transformRequest:transform,
                data:data
            })
        };
        return service;
    }]);

