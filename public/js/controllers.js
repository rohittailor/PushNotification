/**
 * Created by tailor on 8/28/2014.
 */
'use strict';

angular.module('hdxadmin.controllers', [])
    .controller('RedirectCtrl',
    [
        '$scope','$location', function ($scope,$location) {
        $location.path('/notification');
    }])
    .controller('NotificationCtrl',
    [
        '$scope','AdminService', function ($scope,AdminService) {
        //alert("Called");
        $("input[name='rbMessageType']").change(function(){
            if($(this).val()=='broadcast'){
                messageType=0; // broadcast message
                $('#groupPanel').hide();
            }
            else{
                messageType=1; // send message to group
                $('#groupPanel').show();
            }
        });
        $scope.groups=[];
        $scope.loadGroups = function(){
            AdminService.getGroups().success(function(response){
                $scope.groups=response;
                console.dir(response);
            }).error(function(errorData){
                console.log("Error in loading groups");
            });
        }

        $scope.loadGroups()


    }]);
