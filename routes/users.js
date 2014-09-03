/**
 * Created by tailor on 9/3/2014.
 */
var express = require('express');
var router = express.Router();


//get list of users (distinct userID)
router.get('/',function(req,res){
    var db=req.db;
    db.users.distinct('userID',function(err,userList){
        if(err || !userList){
            res.status(500).send({error:'Groups not retrived from DB'});
        }
        else{
            res.set('Content-Type', 'application/json');
            res.send(userList);
        }
        res.end();
    });
});
//
router.delete('/:userID',function(req,res){
    var db=req.db;
    db.users.remove({userID:req.params.userID},function(err,user){
        if(err || !user || user.n<1){
            res.status(500).send({error:'User not exist'});
        }
        else{
            res.status(200).send({msg:'User '+req.params.userID+' removed from all groups'});
        }
        res.end();
    });
});

module.exports = router;