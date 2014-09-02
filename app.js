/**
 * Created by tailor on 8/22/2014.
 */
// Setup basic express server
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs= require('fs');
var http = require('http');
var https = require('https');
var port = process.env.PORT || 3000;
var groups= require('./routes/groups');
var collections = ["groups","users","adminUsers"];

var credentials = {
    key: fs.readFileSync('./cert/privatekey.pem'),
    cert: fs.readFileSync('./cert/certificate.pem')
};
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(port, function () {
    console.log('HTTP Server listening at port %d', port);
    console.log("Push Notification Service Started for "+process.env.NODE_ENV);
});

httpsServer.listen(433, function () {
    console.log('HTTPs Server listening at port %d', 433);
    console.log("Push Notification Service Started for "+process.env.NODE_ENV);
});

var io = require('socket.io')(httpServer);

//configuration file
//var config = require('./config.json')[app.get('env')];

//for mongo DBa
var databaseUrl = "mongodb://127.0.0.1:27017/test";
var imsURL= "ims-na1-qa1.adobelogin.com";

var db = require("mongojs").connect(databaseUrl, collections);
db.on('connect',function(db){
    console.log("Database Connected");
});
db.on('error',function(err){
    console.log("Database Connection Error");
});


// Routing
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//request interceptor for api
app.all('/api/*',function(req, res, next) {
    // validate token here
    if(typeof req.query.accessToken==="undefined"){
        res.status(401).send();
        res.end();
    }
    var opt = {
        host:imsURL,
        path:'/ims/profile/v1?bearer_token='+req.query.accessToken,
        method:'GET'
    };

    var imsProfileCall = https.get(opt,function(response) {
        var str = '';
        response.on('data', function (chunk) {
            //console.log('data chunk: ' + chunk);
            str += chunk;
        });

        response.on('end', function (data) {
            if(str!=""){
                console.log('User Info ' + str);
                var userInfo = JSON.parse(str);
                if(!userInfo.error_flag) {
                    var userGUID = userInfo.userId.split('@')[0];
                    db.adminUsers.findOne({userID:userGUID},function(err,adminUser){
                        if(err){
                            console.log(err);
                            throw err;
                        }
                        if(!err && adminUser){
                            //access token validated and user is valid
                            next();
                        }
                        else{
                            console.log('User is not an admin');
                            res.status(401).send();
                            res.end();
                        }
                    });
                }
                else{
                    console.log('Invalid Access Token');
                    res.status(401).send();
                    res.end();
                }
            }
            else{
                console.log('Invalid Access Token');
                res.status(401).send();
                res.end();
            }
        });
    });

    imsProfileCall.on('error',function(err){
        console.log("Error: " +err);
        imsProfileCall.end();
        res.status(401).send();
        res.end();
    });
});
app.use('/api/groups', groups);

//error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send('error', {
        message: err.message,
        error: {}
    });
});


// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

var adminUsers=[];
adminUsers.push({id:'13CB026E50B4F9430A0574CB',name:'Arnaud Fischer',email:'arnaudf+uss2@adobe.com'});

function joinGroup(socket,currentUser){
    try {
        db.users.find({userID: currentUser.userID}, function (err, users) {
            if (err) {
                console.log(err);
            }
            if (!err && users.length > 0) {
                for (var i = 0; i < users.length; i++) {
                    console.log("Group Name: " + users[i].groupName + " UserID: " + users[i].userID);
                    socket.join(users[i].groupName);
                }
            }
            else {
                console.log("No group for user " + currentUser.userID);
            }
        });
    }
    catch(error){
        console.log("Error in joining group",error);
    }
}

io.sockets.on('connection', function (socket) {
    var addedUser = false;
    console.log("Socket ID: "+socket.id);

    // when the client emits 'new message', this listens and executes
    socket.on('message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data,
            userID:socket.id
        });
    });

    socket.on('AdminMessage',function(data){
        console.log("AdminMessage",data);
        socket.broadcast.emit('AdminMessageBroadCast', data);
    });
    socket.on('AdminMessageToGroup',function(data){
        console.log("AdminMessage To Group: "+data.groupName,data);
        socket.broadcast.to(data.groupName).emit('AdminMessageBroadCast', data);
        //socket.broadcast.emit('AdminMessageBroadCast', data);
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (user) {
        // we store the username in the socket session for this client
        socket.username = user.username;
        console.log(user.username+ " connected");
        // add the client's username to the global list
        usernames[user.username] = user;
        ++numUsers;
        addedUser = true;
        joinGroup(socket,user);
//        socket.emit('login', {
//            username:socket.username,
//            userID:socket.id,
//            numUsers: numUsers
//        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            userID: socket.id,
            numUsers: numUsers
        });
    });



    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        // remove the username from global usernames list
        if (addedUser) {
            delete usernames[socket.username];
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});

module.exports = app;