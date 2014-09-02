/**
 * Created by tailor on 8/22/2014.
 */
// Setup basic express server
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var https = require('https');
var fs= require('fs');
var databaseUrl = "mongodb://127.0.0.1:27017/test"; // "username:password@example.com/mydb"
var collections = ["groups","users"];
var db = require("mongojs").connect(databaseUrl, collections);

var api= require('./')

var imsURL= 'ims-na1-stg1.adobelogin.com';

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});
app.set('view engine', 'jade');
// Routing
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//app.use(function(req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});
//error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send('error', {
        message: err.message,
        error: {}
    });
});

app.post('/api/validate', function (req,res) {
    console.log("Access Token is: "+ req.body.accessToken);
    var opt = {
        host:imsURL,
        path:'/ims/profile/v1?bearer_token='+req.body.accessToken,
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
                res.send(str);
                res.end();
            }
            else{
                res.send(401);
            }
        });
    });

    imsProfileCall.on('error',function(err){
        console.log("Error: " +err);
        imsProfileCall.end();
    });
});
app.get('/api/groups/save',function(req,res){
    fs.writeFile("groups.json", JSON.stringify(groups), "utf8", function(err){
        if(err)
            throw  err;
        console.log("Groups Saved in JSON file");
    });
});

app.post('/api/groups',function(req,res){
    //check if group already exists
    db.groups.find({name:req.body.name},function(err,group){
        if(err || !group || group.length<1){
            //group not exist save it
            db.groups.save({name: req.body.name}, function(err, saved) {
                if( err || !saved ){
                    res.status(500).send({error:'Groups not saved in DB'});
                }
                else{
                    res.status(200).send({msg:'Group '+req.body.name+' Saved'});
                }
                res.end();
            });
        }
        else{
            res.status(500).send({error:'Group '+req.body.name+' already exists'});
            res.end();
        }
    });

});

app.get('/api/groups',function(req,res){
    db.groups.find({},function(err,groups){
        if(err || !groups){
            res.status(500).send({error:'Groups not retrived from DB'});
        }
        else{
            res.set('Content-Type', 'application/json');
            res.send(groups);
        }
        res.end();
    });
});

app.delete('/api/groups/:groupName',function(req,res){
    db.groups.remove({name:req.params.groupName},function(err,group){
        if(err || !group || group.n<1){
            res.status(500).send({error:'Group not exist'});
        }
        else{
            res.status(200).send({msg:'Group '+req.params.groupName+' deleted'});
        }
        res.end();
    });
});
app.get('/api/groups/:groupName/users',function(req,res){
    //check group exist or not
    db.groups.findOne({name:req.params.groupName},function(err,group) {
        if (group) {
            // add user as group exists
            db.users.find({groupName:req.params.groupName},function(err,users){
                if(err || !users){
                    res.status(500).send({error:'Users not exist'});
                }
                else{
                    res.status(200).send(users);
                }
                res.end();
            });
        }
        else{
            //group not exists
            res.status(500).send({error:'Group '+req.params.groupName+' not exist'});
        }
    });

});
app.post('/api/groups/:groupName/users',function(req,res){
    var userObj={
        email:req.body.email,
        userID:req.body.userID,
        groupName:req.params.groupName
    };
    //check group exist or not
    db.groups.findOne({name:userObj.groupName},function(err,group){
        if(group) {
            //group exist now check if user is already exist
            db.users.findOne({userID:userObj.userID,groupName:userObj.groupName},function(err,user) {
                if (user) {
                    //user already exist in that group
                    res.status(500).send({error:'User '+userObj.userID+' already exists'});
                    res.end();
                }
                else {
                    //add user in the group
                    db.users.save(userObj,function(err,users){
                        if(err || !users){
                            res.status(500).send({error:'Error in saving user'});
                        }
                        else{
                            res.status(200).send({msg:'User '+userObj.userID+' saved'});
                        }
                        res.end();
                    });
                }

            });
        }
        else{
            //group not exists
            res.status(500).send({error:'Group '+userObj.groupName+' not exists'});
            res.end();
        }

    });
});
app.delete('/api/groups/:groupName/users/:userID',function(req,res){
    var userObj={
        userID:req.params.userID,
        groupName:req.params.groupName
    };
    //check if group exists
    db.groups.findOne({name:userObj.groupName},function(err,group){
        if(group){
            db.users.findOne({userID:userObj.userID,groupName:userObj.groupName},function(err,user) {
                if (user) {
                    //user exist in group, remove user
                    db.users.remove({userID:userObj.userID},function(err,removed){
                        if(removed){
                            res.status(200).send({msg:'User '+userObj.userID+' deleted'});
                        }
                        else{
                            res.status(500).send({error:'User not deleted'});
                        }
                        res.end();
                    });
                }
                else {
                    //user already exist in that group
                    res.status(500).send({error:'User '+userObj.userID+' not exists in group '+userObj.groupName});
                    res.end();
                }
            });
        }
        else{
            //group not exists
            res.status(500).send({error:'Group '+userObj.groupName+' not exists'});
            res.end();
        }
    });
});


// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

var adminUsers=[];
adminUsers.push({id:'13CB026E50B4F9430A0574CB',name:'Arnaud Fischer',email:'arnaudf+uss2@adobe.com'});

var groups={
    'DL-Hendrix-Admin':[
        {userID:123456,email:'tailor@adobe.com',name:'Rohit Tailor'},
        {userID:654321,email:'nrathore@adobe.com',name:'Nrupendra Rathore'},
        {userID:111222,email:'arnaudf@adobe.com',name:'Arnaud Fischer'}
    ],
    'DL-Hendrix-Users':[
        {userID:333444,email:'santa@adobe.com',name:'Santa Kumar'},
        {userID:444555,email:'manu@adobe.com',name:'Manu Gopinath'},
        {userID:555666,email:'arjuna@adobe.com',name:'Arjuna Velyaudan'}
    ]
};

function joinGroup(socket,user){
    for(var key in groups){
        for(var i=0;i<groups[key].length;i++){
            if(user.userID==groups[key][i].userID) {
                socket.join(key.toString());
                console.log("Group Name: " + key + " UserID: " + groups[key][i].userID);
            }
        }
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