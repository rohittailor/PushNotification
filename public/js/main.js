/**
 * Created by tailor on 8/22/2014.
 */
var SAW = {};

var extendSW = {models: { },
    session: { }
};
SAW = _.extend(SAW, extendSW);

//check query string and handle configurations and token validation
if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function () { };
angular.element(document).ready(function () {
    parseURL();
    loadConfig();
});

function parseURL() {
    var hashParams = decodeURIComponent(window.location.hash), params = {};
    if (hashParams) {

        _.map(hashParams.replace('#', '').replace('?', '&').replace('/', '=').split('&'), function (pair) {
            var kv = pair.split('=');
            if (kv.length === 2) {
                params[kv[0]] = kv[1];
            }
        });
        if (params.access_token) {
            SAW.session.accessToken = params.access_token;
        }
    } else {
        console.log("No params defined in URL");
    }
}
function loadConfig() {
    $.getJSON('config.json', function (data) {
        serviceData = data.services[0];
        SAW.models.serviceData = serviceData;
        validateToken();
    });
}

function validateToken() {
    if(typeof SAW.session.accessToken==="undefined"){
        window.location.href=SAW.models.serviceData.susi_url;
        return;
    }
    $.ajax({
        dataType: "jsonp",
        url: serviceData.ims_profile_url + "?bearer_token=" + SAW.session.accessToken
    }).done(function (response) {
        if (!response.error_flag) {
           var sUserID = response.userId.split('@')[0];
            SAW.session.customerID = sUserID;
            SAW.models.user = response;
            SAW.models.user.customerID = SAW.session.customerID;
            //Bootstrap angular after loading service related data
            angular.bootstrap(document,['hdxadmin']);
            window.location.href='#/notification';
        }
        else {
            console.log("IMS token validation failed: " + response.error_description);
            window.location.href=SAW.models.serviceData.susi_url;
        }
    }).fail(function (errorData) {
        console.log("IMS token validation failed: " + response.error_description);
        window.location.href=SAW.models.serviceData.susi_url;
    });
}
var pushServiceUrl="http://localhost:3000/";
//var socket = io(pushServerUrl);

var currentUser={
    id:"123456",
    username:'Rohit',
    email:'tailor@adobe.com'
};

function countTotalUsers(data) {
    var message = '';
    if (data.numUsers === 1) {
        message += "there's 1 participant";
    } else {
        message += "there're " + data.numUsers + " participants";
    }
    console.log(message);
}



function logMessage(data){
    var msg = $('#log').val();
    msg= msg+'\n'+data;
    $('#log').val(msg);
}


