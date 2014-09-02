/**
 * Created by tailor on 8/28/2014.
 */
'use strict';

angular.module('hdxadmin.controllers', [])
    .controller('MainCtrl',
    ['$scope','socket','$location',function($scope,socket,$location){
        socket.on('connect',function(){
            console.log("Connected to push notification server");
            socket.emit('add user', currentUser);
        });
        // Whenever the server emits 'new message', update the chat body
        socket.on('AdminMessageBroadCast', function (data) {
            console.log(data);
            var str= "Message Title: "+data.messageTitle+", Message Description: "+data.messageDescription;
            logMessage(str);
        });

        $scope.isActive = function(currentLoc){
            if(currentLoc==$location.path()){
                return true;
            }
            return false;
        };
    }])
    .controller('NotificationCtrl',
    [
        '$scope','AdminService','socket', function ($scope,AdminService,socket) {

        $scope.groups=[];
        $scope.loadGroups = function(){
            AdminService.getGroups().success(function(response){
                $scope.groups=response;
                console.dir(response);
            }).error(function(errorData){
                console.log("Error in loading groups");
            });
        };

        $scope.loadGroups();

        $scope.messageType = 0; // broadcast
        $scope.sendMessage = function(){
            if($scope.messageType==0){
                $scope.broadCastMessage();
            }
            else{
                $scope.sendMessageToGroup()
            }
        };

        $scope.isFormValid = function(){
            if($scope.messageType==0)
                return $scope.msgTitle && $scope.msgDescription;
            else
                return $scope.msgTitle && $scope.msgDescription && $scope.selectedGroup!="";
        };

        $scope.broadCastMessage= function(){
            var messageObj = {
                messageType:$scope.messageType, // 0 for broadcast
                messageTitle:$scope.msgTitle,
                messageDescription:$scope.msgDescription,
                messageFrom:currentUser
            };
            //broadcast message to all users
            socket.emit('AdminMessage',messageObj);
        };

        $scope.sendMessageToGroup = function(){
            var messageObj = {
                messageType:$scope.messageType, // 0 for broadcast
                messageTitle:$scope.msgTitle,
                messageDescription:$scope.msgDescription,
                messageFrom:currentUser,
                groupName:$scope.selectedGroup
            };
            //broadcast message to group
            socket.emit('AdminMessageToGroup',messageObj);
        };
    }])
    .controller('GroupsCtrl',
    ['$scope','AdminService',function($scope,AdminService){
        $scope.customer = {};
        $scope.showMessage = function (type, message)
        {
            $scope.customer.messages = [];
            $scope.customer.messages.push({
                info:type == "info",
                error:type == "error",
                success:type == "success",
                text:message
            });
        };

        $scope.groups=[];
        $scope.loadGroups = function(){
            AdminService.getGroups().success(function(response){
                $scope.groups=response;
                //console.dir(response);
            }).error(function(errorData){
                console.log("Error in loading groups");
            });
        };
        $scope.loadGroups();

        $scope.isGroupValid = function(){
            return $scope.selectedGroup!="";
        };

        $scope.deleteGroup = function(){
            AdminService.deleteGroup($scope.selectedGroup).success(function(response){
                console.log("Group "+$scope.selectedGroup+" Deleted");
                for(var i=0;i<$scope.groups.length;i++){
                    if($scope.groups[i].name==$scope.selectedGroup){
                        //delete group from local model
                        $scope.groups.splice(i,1);
                    }
                }
                $scope.showMessage('success','Group '+$scope.selectedGroup+' Deleted');
                $scope.selectedGroup="";
            }).error(function(errorData){
                console.log("Error in deleting group: "+errorData);
                $scope.showMessage('error',errorData.error);
            });
        };

        $scope.isGroupNameValid = function(){
            return $scope.groupName;
        };

        $scope.addGroup = function($event){
            var btn = $($event.target);
            btn.button('loading');
            AdminService.addGroup({name:$scope.groupName}).success(function(response){
                console.log("Group "+$scope.groupName+" added");
                $scope.groupName="";
                $scope.loadGroups();
                btn.button('reset');
                $scope.showMessage('success','Group '+$scope.groupName+' Saved');
            }).error(function(errorData){
                console.log(errorData);
                $scope.showMessage('error',errorData.error);
                btn.button('reset');
            });
        };
    }])
    .controller('UsersCtrl',
    ['$scope','AdminService',function($scope,AdminService){

    }]);
