/**
 * Created by tailor on 8/28/2014.
 */
'use strict';

angular.module('hdxadmin.controllers', [])
    .controller('LoginCtrl',
    ['$scope','AdminService','$rootScope',function($scope,AdminService,$rootScope){
        $rootScope.isLoggedIn=false;
        showMainLoader();
        setTimeout(function(){
            $scope.$apply(function(){
               $scope.logout();
            });
        },4000);
        $scope.logout = function(){
            AdminService.logout().success(function(response){
                window.location.href=SAW.models.serviceData.susi_url;
            }).error(function(errorData){
                window.location.href=SAW.models.serviceData.susi_url;
            });
        };
    }])
    .controller('MainCtrl',
    ['$scope','socket','$location','AdminService','$rootScope',function($scope,socket,$location,AdminService,$rootScope){
        $scope.username=SAW.models.user.name;

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

        $scope.logout = function(){
            AdminService.logout().success(function(response){
                window.location.href=SAW.models.serviceData.susi_url;
            }).error(function(errorData){
                window.location.href=SAW.models.serviceData.susi_url;
            });
        };
        hideMainLoader();
        $rootScope.isLoggedIn=true;
    }])
    .controller('NotificationCtrl',
    [
        '$scope','AdminService','socket', function ($scope,AdminService,socket) {
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
            showMainLoader();
            AdminService.getGroups().success(function(response){
                $scope.groups=response;
                console.dir(response);
                hideMainLoader();
            }).error(function(errorData){
                console.log("Error in loading groups");
                hideMainLoader();
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
            showMainLoader();
            var messageObj = {
                messageType:$scope.messageType, // 0 for broadcast
                messageTitle:$scope.msgTitle,
                messageDescription:$scope.msgDescription,
                messageFrom:currentUser
            };
            //broadcast message to all users
            socket.emit('AdminMessage',messageObj);
            $scope.showMessage('success','Message sent to all users');
            $scope.msgTitle="";
            $scope.msgDescription="";
            hideMainLoader();
        };

        $scope.sendMessageToGroup = function(){
            showMainLoader();
            var messageObj = {
                messageType:$scope.messageType, // 0 for broadcast
                messageTitle:$scope.msgTitle,
                messageDescription:$scope.msgDescription,
                messageFrom:currentUser,
                groupName:$scope.selectedGroup
            };
            //broadcast message to group
            socket.emit('AdminMessageToGroup',messageObj);
            $scope.showMessage('success','Message sent to group');
            $scope.msgTitle="";
            $scope.msgDescription="";
            hideMainLoader();
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
            showMainLoader();
            AdminService.getGroups().success(function(response){
                $scope.groups=response;
                hideMainLoader();
            }).error(function(errorData){
                hideMainLoader();
                console.log("Error in loading groups");
            });
        };
        $scope.loadGroups();

        $scope.isGroupValid = function(){
            return $scope.selectedGroup!="";
        };

        $scope.deleteGroup = function(){
            showMainLoader();
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
                hideMainLoader();
            }).error(function(errorData){
                console.log("Error in deleting group: "+errorData);
                $scope.showMessage('error',errorData.error);
                hideMainLoader();
            });
        };

        $scope.isGroupNameValid = function(){
            return $scope.groupName;
        };

        $scope.addGroup = function($event){
            showMainLoader();
            AdminService.addGroup({name:$scope.groupName}).success(function(response){
                console.log("Group "+$scope.groupName+" added");
                $scope.groupName="";
                $scope.loadGroups();
               $scope.showMessage('success','Group '+$scope.groupName+' Saved');
                hideMainLoader();
            }).error(function(errorData){
                console.log(errorData);
                $scope.showMessage('error',errorData.error);
                hideMainLoader();
            });
        };

        $('#myTab a').click(function (e) {
            e.preventDefault();
            $('.alert').remove();

        });
    }])
    .controller('UsersCtrl',
    ['$scope','AdminService','socket',function($scope,AdminService,socket){
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
            $('.alert').remove();
            showMainLoader();
            AdminService.getGroups().success(function(response){
                $scope.groups=response;
                hideMainLoader();
            }).error(function(errorData){
                console.log("Error in loading groups");
                hideMainLoader();
            });
        };
        $scope.loadGroups();

        $scope.isFormValid = function(){
            return $scope.userID && $scope.selectedGroup!="";
        };

        $scope.AddUser = function($event){
            showMainLoader();
            $('.alert').remove();
            var btn = $($event.target);
            //btn.button('loading');
            AdminService.addUser($scope.selectedGroup,{userID:$scope.userID}).success(function(response){
                console.log("User "+$scope.userID+" added to "+$scope.selectedGroup);
                $scope.showMessage('success',"User "+$scope.userID+" added to "+$scope.selectedGroup);
                //broadcast an event to all connected users that user updated
                socket.emit('UsersUpdated',{userID:$scope.userID});
                $scope.userID="";
                hideMainLoader();
            }).error(function(errorData){
                console.log(errorData);
                $scope.showMessage('error',errorData.error);
                hideMainLoader();
            });
        };

        $scope.users=[];
        $scope.isUsersLoaded=false;
        //load users from group
        $scope.loadUsers = function(){
            showMainLoader();
            $('.alert').remove();
            if($scope.selectedGroupName==""){
                hideMainLoader();
                return;
            }
            $scope.isUsersLoaded=false;
            AdminService.getUsers($scope.selectedGroupName).success(function(response){
               // $scope.groups=response;
                console.log("Users",response);
                $scope.users=response;
                if(response.length<1){
                    $scope.showMessage('info',"No user in group "+$scope.selectedGroupName);
                    hideMainLoader();
                    return;
                }
                $scope.isUsersLoaded=true;
                $scope.selectedUser="";
                hideMainLoader();
            }).error(function(errorData){
                console.log("Error in loading users");
                $scope.showMessage('error',errorData.error);
                $scope.isLoadingUsers=false;
                hideMainLoader();
            });
        };

        $scope.allUsers=[];
        $scope.loadAllUsers = function(){
            showMainLoader();
            AdminService.getAllUsers().success(function (response) {
                $scope.allUsers=[];
                if(response.length<1){
                    $scope.showMessage('info','No users');
                    hideMainLoader();
                    return;
                }
                for(var i=0;i<response.length;i++){
                    $scope.allUsers.push({userID:response[i]});
                }
                hideMainLoader();
            }).error(function(errorData){
                hideMainLoader();
            });
        };
        //$scope.loadAllUsers();

        $scope.isRemoveUserAllValid = function(){
            return $scope.userToRemove!="";
        };

        $scope.isRemoveDataValid = function(){
            return $scope.selectedGroupName!="" && $scope.selectedUser;
        };

        $scope.removeUserFromAll = function(){
            showMainLoader();
            //its because after removing using api w can check on db (user groups)
            socket.emit("UserRemovedFromAll",{userID:$scope.userToRemove});
            AdminService.removeUserFromAll($scope.userToRemove).success(function(response){
                $scope.showMessage("success","User removed from all groups");
                for(var i=0;i<$scope.allUsers.length;i++){
                    if($scope.allUsers[i].userID==$scope.userToRemove){
                        //delete user from local Users model
                        $scope.allUsers.splice(i,1);
                    }
                }
                $scope.userToRemove="";
                hideMainLoader();
            }).error(function(errorData){
                $scope.showMessage("error",errorData.error);
                console.log("Error in removing user from all groups");
                hideMainLoader();
            });
        };

        $scope.removeUser =function($event){
            $('.alert').remove();
            showMainLoader();
            AdminService.removeUser($scope.selectedGroupName,$scope.selectedUser).success(function(response){
                $scope.showMessage('success','User removed from group');
                for(var i=0;i<$scope.users.length;i++){
                    if($scope.users[i].userID==$scope.selectedUser){
                        //delete user from local Users model
                        $scope.users.splice(i,1);
                    }
                }
                socket.emit('UserRemovedFromGroup',{groupName:$scope.selectedGroupName,userID:$scope.selectedUser});
                $scope.selectedUser="";
                hideMainLoader();
            }).error(function(errorData){
                $scope.showMessage('error',errorData.error);
                console.log("Error in removing user from group")
                hideMainLoader();
            });
        };

        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            console.log("Acivated Tab",e.target);// activated tab
            if(e.target.hash=="#removeUserPanel")
            {
                $scope.$apply(function(){
                    $scope.loadAllUsers(); //load All users to fill dropdown
                });
            }
        });

        $('#myTab a').click(function (e) {
            e.preventDefault();
            $('.alert').remove();
            $scope.$apply(function(){
                $scope.selectedGroup="";
                $scope.selectedGroupName="";
                $scope.users=[];
                $scope.isUsersLoaded=false;
                $scope.userToRemove="";
            });
        });
    }]);
