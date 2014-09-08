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
                return serviceData.service_url+'api';
            }
        }

    })
    .factory('socket',['$rootScope',function ($rootScope) {
        //Node.js server URL is SAW.models.serviceData.service_url loaded using config.json
        //For Secure connection
        //var socket = io.connect('https://localhost', {secure: true});
        //var socket = io.connect('https://localhost:3210/', { agent: https.globalAgent });
        var socket = io.connect(SAW.models.serviceData.service_url);
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
        //load all users
        service.getAllUsers = function (groupName) {
            var serviceURL;
            serviceURL=baseUrl.getServiceUrl()+'/users?accessToken='+SAW.session.accessToken;
            return $http({
                method:'GET',
                url:serviceURL
            })
        };
        //load users
        service.getUsers = function (groupName) {
            var serviceURL;
            serviceURL=baseUrl.getServiceUrl()+'/groups/'+groupName+'/users?accessToken='+SAW.session.accessToken;
            return $http({
                method:'GET',
                url:serviceURL
            })
        };
        //add user
        service.addUser= function(groupName,data) {
            var serviceURL;
            serviceURL=baseUrl.getServiceUrl()+'/groups/'+groupName+'/users?accessToken='+SAW.session.accessToken;
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
        //remove User from specific group
        service.removeUser= function (groupName,userID) {
            var serviceURL;
            serviceURL=baseUrl.getServiceUrl()+'/groups/'+groupName+'/users/'+userID+'?accessToken='+SAW.session.accessToken;
            return $http({
                method:'DELETE',
                url:serviceURL
            })
        };
        //remove User from all groups
        service.removeUserFromAll= function (userID) {
            var serviceURL;
            serviceURL=baseUrl.getServiceUrl()+'/users/'+userID+'?accessToken='+SAW.session.accessToken;
            return $http({
                method:'DELETE',
                url:serviceURL
            })
        };
        //logout service
        service.logout = function(){
            return $http.jsonp(SAW.models.serviceData.logout_url + "?auth_token=" + SAW.session.accessToken+ '&callback=JSON_CALLBACK');
        }
        return service;
    }]);

