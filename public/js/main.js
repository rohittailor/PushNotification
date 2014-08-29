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
var pushServerUrl="http://localhost:3000/";
var socket = io(pushServerUrl);

$(document).ready(function () {
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
});

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

var messageType = 0; // broadcast
function sendMessage(){
    if(messageType==0){
        broadCastMessage();
    }
    else{
        sendMessageToGroup()
    }
}

function broadCastMessage(){
    var messageObj = {
        messageType:0, // 0 for broadcast
        messageTitle:$('#txtMessageType').val(),
        messageDescription:$('#txtMessageDescription').val(),
        messageFrom:currentUser
    };

    socket.emit('AdminMessage',messageObj);
}

function sendMessageToGroup(){
    var groupName = $('#ddGroup :selected').text();
    var messageObj = {
        messageType:1, // 0 for broadcast
        messageTitle:$('#txtMessageType').val(),
        messageDescription:$('#txtMessageDescription').val(),
        messageFrom:currentUser,
        groupName:groupName
    };

    socket.emit('AdminMessageToGroup',messageObj);
}

function logMessage(data){
    var msg = $('#log').val();
    msg= msg+'\n'+data;
    $('#log').val(msg);
}


//Socket Events
socket.on('connect',function(){
    console.log("Connected to push notification server");
    socket.emit('add user', currentUser);
});

// Whenever the server emits 'login', log the login message
socket.on('login', function (user) {
    connected = true;
    console.log(user.username+" logged-in to server, Connection ID is:"+user.userID);
    countTotalUsers(user);
});

// Whenever the server emits 'new message', update the chat body
socket.on('AdminMessageBroadCast', function (data) {
    console.log(data);
    var str= "Message Title: "+data.messageTitle+", Message Description: "+data.messageDescription;
    logMessage(str);
});

socket.on('message', function (data) {
    addChatMessage(data);
});

// Whenever the server emits 'user joined', log it in the chat body
socket.on('user joined', function (data) {
    console.log(data.username + ' joined, Connection ID is:'+data.userID);
    countTotalUsers(data);
});

// Whenever the server emits 'user left', log it in the chat body
socket.on('user left', function (data) {
    console.log(data.username + ' left');
    countTotalUsers(data);
});