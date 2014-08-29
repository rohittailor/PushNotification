/**
 * Created by tailor on 8/28/2014.
 */
'use strict';


angular.module('hdxadmin.services', [])

    .value('version', '0.1')
    .factory('baseUrl',function(){
        return {
            getServiceUrl:function(){
                return serviceData.service_url;
            }
        }

    })
    .factory('AdminService', ['$http', 'baseUrl',function ($http, baseUrl) {

        var service = {};

        service.getGroups = function () {
            var serviceURL;
            serviceURL=baseUrl.getServiceUrl()+'/groups';
            return $http({
                method:'GET',
                url:serviceURL
            })
        };

        service.updateTicket = function (customerId, data, ticketId) {
            var serviceURL;
            var accessToken=SAW.session.accessToken;
            customerId=SAW.session.customerID;
            var organizationID=SAW.session.organization;

            if(SAW.context.type==1){
                serviceURL=baseUrl.getServiceUrl()+'/'+customerId+'/organisations/'+organizationID +'/tickets/'+ticketId;
            }
            else{
                serviceURL=baseUrl.getServiceUrl() + '/' + customerId + '/tickets/' + ticketId;
            }
            return $http({
                method:'PUT',
                url:serviceURL+'?authsrc='+SAW.session.authSrc+'&j_orgid='+SAW.session.janusOrgID+'&api_key='+SAW.models.serviceData.api_key+'&access_token=' +  accessToken + '&user-token=' + accessToken,
                data:data
            })
        }

        service.getTicketsByStatus = function (status) {
            var serviceURL;
            var accessToken=SAW.session.accessToken;
            var customerId=SAW.session.customerID;
            var organizationID=SAW.session.organization;

            if(SAW.context.type==1){
                serviceURL=baseUrl.getServiceUrl()+'/'+customerId+'/organisations/'+organizationID +'/tickets?status='+status;
            }
            else{
                serviceURL=baseUrl.getServiceUrl() + '/' + customerId + '/tickets?status='+status;
            }
            return $http({
                method:'GET',
                url:serviceURL+'&j_orgid='+SAW.session.janusOrgID+'&api_key='+SAW.models.serviceData.api_key+'&access_token=' +  accessToken + '&user-token=' + accessToken+'&cObj='+SAW.models.ticketsCache,
                cache: ticketsCache,
                timeout:240000
            })

        }

        service.getTicket = function (customerId, ticketId) {
            var serviceURL;
            var accessToken=SAW.session.accessToken;
            customerId=SAW.session.customerID;
            var organizationID=SAW.session.organization;
            var d=new Date();


            if(SAW.context.type==1){
                serviceURL=baseUrl.getServiceUrl()+'/'+customerId+'/organisations/'+organizationID +'/tickets/'+ticketId;
            }
            else{
                serviceURL=baseUrl.getServiceUrl() + '/' + customerId + '/tickets/' + ticketId;
            }
            return $http({
                method:'GET',
                url:serviceURL+'?j_orgid='+SAW.session.janusOrgID+'&api_key='+SAW.models.serviceData.api_key+'&access_token=' +  accessToken + '&user-token=' + accessToken + '&date='+ d.getTime(),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            })
        }

        service.uploadFile = function (customerId, ticketId, data) {
            var serviceURL;
            var accessToken=SAW.session.accessToken;
            customerId=SAW.session.customerID;
            var organizationID=SAW.session.organization;

            if(SAW.context.type==1){
                serviceURL=baseUrl.getServiceUrl() + '/' + organizationID + '/ticket_attachments/' + ticketId;
            }
            else{
                serviceURL=baseUrl.getServiceUrl() + '/' + customerId + '/ticket_attachments/' + ticketId;
            }
            return $http({
                method:'POST',
                url:serviceURL+'/?api_key='+SAW.models.serviceData.api_key+'&access_token=' +  accessToken + '&user-token=' + accessToken,
                data:data
            })
        }

        //get user details
        service.getUserDetails= function(){
            var serviceURL;
            var accessToken=SAW.session.accessToken;
            var customerId=SAW.session.customerID;
            var organizationID=SAW.session.organization;

            return $http({
                method:'GET',
                url:baseUrl.getServiceUrl()+'/'+customerId+'/details'+'?api_key='+SAW.models.serviceData.api_key+'&access_token=' +  accessToken + '&user-token=' + accessToken
            });
        }


        //get user details
        service.getSupportedProducts= function(){
            var accessToken=SAW.session.accessToken;
            var serviceURL;
            var customerId=SAW.session.customerID;
            var organizationID=SAW.session.organization;
            if(SAW.context.type==1){
                serviceURL=baseUrl.getServiceUrl() + '/' + customerId + '/organisations/' + organizationID+'/products';
            }
            else{
                serviceURL=baseUrl.getServiceUrl() + '/' + customerId +'/products';
            }
            return $http({
                method:'GET',
                url:serviceURL+'?api_key='+SAW.models.serviceData.api_key+'&access_token=' +  accessToken + '&user-token=' + accessToken
            });
        }


        service.getOrgCRMId = function(){
            var accessToken=SAW.session.accessToken;
            var organizationID=SAW.session.organization;
            return $http({
                method:'GET',
                url:baseUrl.getServiceUrl().replace('customers','')+'aaui/'+organizationID+'/crmid'+'?api_key='+SAW.models.serviceData.api_key+'&access_token=' +  accessToken + '&user-token=' + accessToken
            });
            //url:baseUrl.getServiceUrl().replace('customers','')+'aaui/'+organizationID+'/crmid'+'?api_key='+SAW.models.serviceData.api_key+'&access_token=' +  accessToken + '&user-token=' + accessToken
        };

        service.downloadAttachment= function(ticketID,fileKey){
            var customerId=SAW.session.customerID;
            var accessToken=SAW.session.accessToken;
            var organizationID=SAW.session.organization;
            var url;
            if(SAW.context.type==1){
                url= baseUrl.getServiceUrl()+'/'+customerId+'/organisations/'+SAW.session.organization+'/ticket_attachments/'+ticketID+'/'+fileKey+'?api_key='+SAW.models.serviceData.api_key+'&access_token=' +  accessToken + '&user-token=' + accessToken;
            }
            else{
                url= baseUrl.getServiceUrl()+'/'+customerId+'/ticket_attachments/'+ticketID+'/'+fileKey+'?api_key='+SAW.models.serviceData.api_key+'&access_token=' +  accessToken + '&user-token=' + accessToken;
            }
            window.open(url);
        };

        //get user details
        service.login = function (user, pass) {
            return $http.jsonp(SAW.models.serviceData.ims_url + 'login/v1/token?username=' + encodeURIComponent(user) + '&password=' + encodeURIComponent(pass) + '&client_id=stormcloud&scope=openid&callback=JSON_CALLBACK');
        };

        service.getUploadURL = function(ticketID){
            var tempUploadURL;
            if(SAW.context.type==1){
                tempUploadURL= SAW.models.serviceData.service_url+'/'+SAW.session.customerID+'/organisations/'+SAW.session.organization+'/ticket_attachments/'+ticketID+'/upload?api_key='+SAW.models.serviceData.api_key+'&access_token=' +  SAW.session.accessToken + '&user-token=' + SAW.session.accessToken;
                tempUploadURL=tempUploadURL+'&j_orgid='+SAW.session.janusOrgID;
            }
            else{
                tempUploadURL= SAW.models.serviceData.service_url+'/'+SAW.session.customerID+'/ticket_attachments/'+ticketID+'/upload?api_key='+SAW.models.serviceData.api_key+'&access_token=' +  SAW.session.accessToken + '&user-token=' + SAW.session.accessToken;
            }

            return tempUploadURL;
        };

        service.validateToken= function(accessToken){
            return $http.jsonp(SAW.models.serviceData.ims_profile_url + "?bearer_token=" + accessToken+ '&client_id=stormcloud&scope=openid&callback=JSON_CALLBACK');
        };

        return service;
    }])
    .factory('ticketsCache',['$cacheFactory',function($cacheFactory) {
        return $cacheFactory('ticketsData');
    }])
    .factory('Auth',['$http','$rootScope','localStorageService','$location','redirectToUrlAfterLogin',function($http,$rootScope,localStorageService,$location,redirectToUrlAfterLogin){
        var service={User:{}};

        service.login=function (user, pass) {
            return $http.jsonp(IMS + '?username=' + encodeURIComponent(user) + '&password=' + encodeURIComponent(pass) + '&client_id=stormcloud&scope=openid&callback=JSON_CALLBACK');
        };

        service.isLoggedIn = function() {
            if(localStorageService.get('User')!=null){
                this.User = localStorageService.get('User');
            }
            else{
                this.User.isAuthenticated=false;
                this.User.currentUser=null;
            }
            return this.User.isAuthenticated;

        };

        service.logout= function() {
            this.User.isAuthenticated=false;
            this.User.currentUser=null;
            redirectToUrlAfterLogin.url='/account';
            localStorageService.clearAll();

            return $http.jsonp(SAW.models.serviceData.logout_url + "?auth_token=" + SAW.session.accessToken+ '&callback=JSON_CALLBACK');
        };

        service.getUser=function()
        {
            if(localStorageService.get('User')!=null){
                this.User = localStorageService.get('User');
            }
            return this.User;
        };
        service.setUser = function(updatedUser)
        {
            if(localStorageService.get('User')!=null){
                localStorageService.clearAll();
            }
            updatedUser.isAuthenticated=true;
            localStorageService.add('User',updatedUser);
            // return updatedUser;
        };

        service.saveAttemptUrl= function() {
            if($location.path().toLowerCase() == '/' || $location.path().toLowerCase()=='') {
                redirectToUrlAfterLogin.url = '/account';
            }
            else{
                redirectToUrlAfterLogin.url = $location.path();
            }

        };

        service.seRedirectURL = function(newURL){
            redirectToUrlAfterLogin.url=newURL;
        };

        service.redirectToAttemptedUrl= function() {
            $location.path(redirectToUrlAfterLogin.url);
        };

        return service;

    }]);

