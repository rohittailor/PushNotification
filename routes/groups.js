var express = require('express');
var fs= require('fs');
var router = express.Router();

router.get('/save',function(req,res){
    fs.writeFile("groups.json", JSON.stringify(groups), "utf8", function(err){
        if(err)
            throw  err;
        console.log("Groups Saved in JSON file");
    });
});

router.post('/',function(req,res){
    var db=req.db;
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

router.get('/',function(req,res){
    try{
        var db=req.db;
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
    }
    catch(error){
        console.log("Error in loading groups "+error);
    }
});

router.delete('/:groupName',function(req,res){
    var db=req.db;
    db.groups.remove({name:req.params.groupName},function(err,group){
        if(err || !group || group.n<1){
            res.status(500).send({error:'Group not exist'});
        }
        else{
            res.status(200).send({msg:'Group '+req.params.groupName+' deleted'});
            //delete users with group
            db.users.remove({groupName:req.params.groupName});
        }
        res.end();
    });
});
router.get('/:groupName/users',function(req,res){
    var db=req.db;
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
router.post('/:groupName/users',function(req,res){
    var db=req.db;
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
router.delete('/:groupName/users/:userID',function(req,res){
    var db=req.db;
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
                    db.users.remove({userID:userObj.userID,groupName:userObj.groupName},function(err,removed){
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

module.exports = router;