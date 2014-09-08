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
var users= require('./routes/users');
var collections = ["groups","users","adminUsers"];

var credentials = {
    key: fs.readFileSync('./cert/privatekey.pem'),
    cert: fs.readFileSync('./cert/certificate.pem')
    //pfx: fs.readFileSync('server.pfx')
};

https.globalAgent.options.rejectUnauthorized = false;

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

//configuration file
var env= process.env.NODE_ENV || 'qa';
app.set('env',env);
var config = require('./config.json')[app.get('env')];

console.log("process.env.NODE_ENV :"+process.env.NODE_ENV);
httpServer.listen(port, function () {
    console.log('HTTP Server listening at port %d', port);
    console.log("Push Notification Service Started for "+app.get('env'));
});

httpsServer.listen(443, function () {
    console.log('HTTPs Server listening at port %d', 443);
    console.log("Push Notification Service Started for "+app.get('env'));
});

var io = require('socket.io')(httpsServer);

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});



//for mongo DBa
var databaseUrl = config.databaseUrl;
var imsURL= config.imsURL;
console.log("Configuration",config);

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
    //assign db object to req so that db will be available in router also
    req.db = db;
    //enable CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, *');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
        res.end();
    }
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
                //console.log('User Info ' + str);
                var userInfo = JSON.parse(str);
                if(!userInfo.error_flag) {
                    var userEmail = userInfo.email;
                    db.adminUsers.findOne({email:userEmail},function(err,adminUser){
                        if(err){
                            res.status(500).send({error:'Failed to connect with Database'});
                            res.end();
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
app.use('/api/users', users);

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
io.set('origins','*:*' );
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
        console.log("AdminMessage Sent");
        console.log("-----------------");
        socket.broadcast.emit('AdminMessageBroadCast', data);
    });
    socket.on('AdminMessageToGroup',function(data){
        console.log("AdminMessage To Sent to Group "+data.groupName);
        console.log("-----------------------------------------------");
        socket.broadcast.to(data.groupName).emit('AdminMessageBroadCast', data);
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (user) {
         // we store the username in the socket session for this client
        socket.userID = user.userID;
        joinGroup(socket,user);
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            userID: socket.id,
            numUsers: numUsers
        });
    });
    //admin will send 'UsersUpdated' when change any user or group
    socket.on('UsersUpdated',function(user){
        console.log("Users and Groups updated by Admin");
        socket.broadcast.emit('UserUpdated',user);
    });
    //admin will send 'UserRemovedFromGroup' when user removed from group
    socket.on('UserRemovedFromGroup',function(data){
        socket.broadcast.emit('UserRemovedFromGroup',data);
    });
    //admin will send 'UserRemovedFromAll' when user removed from all groups
    socket.on('UserRemovedFromAll',function(data){
        socket.broadcast.emit('UserRemovedFromAll',data);
    });

    //client app will send 'RemoveUserFromGroup' when user removed from group using 'UserRemovedFromGroup'
    socket.on('RemoveUserFromGroup',function(data){
        socket.leave(data.groupName);
    });
    //client app will send 'RemoveUserFromAllGroup' when user removed from group using 'UserRemovedFromAll'
    socket.on('RemoveUserFromAllGroup',function(data){
        db.users.find({userID:data.userID},function(err,userList){
            if(!err && userList.length>0){
                for(var i=0;i<userList.length;i++)
                socket.leave(userList[i].groupName);
            }
        });
    });
    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        // remove the username from global usernames list
        if (addedUser) {
            delete usernames[socket.userID];
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                userID: socket.userID,
                numUsers: numUsers
            });
        }
    });
});

module.exports = app;