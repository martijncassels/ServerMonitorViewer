var Promise = require('bluebird');
var Messages = require('../models/messages.js');
var Workshops = require('../models/workshops.js');
var Profiles = require('../models/profiles.js');
var mongoose = require('mongoose');
var moment = require('moment');

Promise.promisifyAll(mongoose);

var db = mongoose.connection;

moment().format();

/*
 * Serve JSON to our AngularJS client
 */

// get a single workshop
// should i make a new db schema+model or query with aggregation?
exports.getworkshop = function(req, res) {

    //var promise = Messages.find({'_id': req.params.id}).exec() //only parent messages, no comments
    var promise = Workshops.findOne({}).populate(['factory','members','messages']).lean().exec() //only parent messages, no comments

    promise.then(function(workshops) {
        //workshops.toObject();
        workshops.creationdatepretty = moment(workshops.creationdate).format('YYYY-MM-DD');
        workshops.lastupdatepretty = moment(workshops.lastupdate).format('YYYY-MM-DD');

        var promise = Messages.aggregate([
            {
                $match: {
                    $or: [{ 'author': req.params.username},{'childs.author': req.params.username}]
                }

            },
            {
                $unwind: "$childs"
            },
            {
                $group: {
                    _id:req.params.username,
                    count: { $sum: 1 }
                }
            }
        ]).execAsync()
        .then(function(count){
          workshops.count = count;
          res.json(workshops);
        })
        .catch(function(err){
          res.send(err);
        })
        //res.json(workshops);
    })
    .catch(function(err){
        res.send(err);
    })
}

exports.getworkshop2 = function(req, res) {
    Promise.props({
    //var promise = Messages.find({'_id': req.params.id}).exec() //only parent messages, no comments
    workshop: Workshops.findById({'_id': req.params.id}).populate(['factory','members','messages']).lean().execAsync(), //only parent messages, no comments
    counttotalmessages: Messages.aggregate([
            {
                $match: {
                    'author': req.params.username
                }

            },
            // {
            //     $unwind: "$childs"
            // },
            {
                $group: {
                    _id:'$author',
                    count: { $sum: 1 }
                }
            }
        ]).execAsync(),
    countworkshopmessages:  Workshops.aggregate([
            //{$unwind: "$messages"},
            {
              $lookup: {
                  from: 'messages',
                  localField: 'messages',
                  foreignField: '_id',
                  as: 'messages'
                  }
            }
            ,{$unwind: "$messages"}
            //,{$unwind: "$messages.childs"}
            ,{
                $match: {
                    'messages.author': req.params.username
                }
            }
            ,{
                $group: {
                    _id:req.params.username,
                    count: { $sum: 1 }
                }
            }
        ]).execAsync(),
    counttotalcomments: Messages.aggregate([
            {
                $unwind: "$childs"
            },{
                $match: {
                  'childs.author': req.params.username
                }
            },
            {
                $group: {
                    _id:'$childs.author',
                    count: { $sum: 1 }
                }
            }
        ]).execAsync(),
    countworkshopcomments: Workshops.aggregate([
            //{$unwind: "$messages"},
            {
              $lookup: {
                  from: 'messages',
                  localField: 'messages',
                  foreignField: '_id',
                  as: 'messages'
                  }
            }
            ,{$unwind: "$messages"}
            ,{$unwind: "$messages.childs"}
            ,{
                $match: {
                    'messages.childs.author': req.params.username
                }
            }
            ,{
                $group: {
                    _id:req.params.username,
                    count: { $sum: 1 }
                }
            }
        ]).execAsync(),
    //messages: Messages.findById({workshop:req.params.id}).execAsync()
        //res.json(workshops);
    })
    // .then(function(data){
    //     data.creationdatepretty = moment(data.creationdate).format('YYYY-MM-DD');
    //     data.lastupdatepretty = moment(data.lastupdate).format('YYYY-MM-DD');
    // })
    .then(function(data){
        data.workshop.creationdatepretty = moment(data.workshop.creationdate).format('YYYY-MM-DD');
        data.workshop.lastupdatepretty = moment(data.workshop.lastupdate).format('YYYY-MM-DD');
        //data.countmessages[0].currentcount = 1;
        //data.countcomments[0].countcurrent = 1;
        //console.log(data);
        for(let i=0;i<data.workshop.messages.length;i++){
          data.workshop.messages[i].creationdatepretty = moment(data.workshop.messages[i].creationdate).format('MMMM Do YYYY, hh:mm');
          data.workshop.messages[i].lastupdatepretty = moment(data.workshop.messages[i].lastupdate).format('MMMM Do YYYY, hh:mm');
          data.workshop.messages[i].lastupdatefromnow = moment(data.workshop.messages[i].lastupdate).fromNow();
        }
        res.json(data);
    })
    .catch(function(err){
        res.send(err);
    })
}

exports.saveworkshop = function(req,res){
    Workshops.create({
      creationdate : req.body.creationdate.$modelValue,
			lastupdate : req.body.lastupdate.$modelValue,
			factory : req.body.factory.$modelValue,
			members : req.body.members.$modelValue,
			messages : req.body.messages.$modelValue
    }, function(err, workshop) {
        if (err) res.send(err)
        res.json(workshop);
    });
}

exports.updateworkshop = function(req,res){
  var promise = Workshops.findById(req.params.id).exec()
  //console.log(req.body);
  promise.then(function(workshop){

    workshop.creationdate = req.body.creationdate.$modelValue;
    workshop.lastupdate = req.body.lastupdate.$modelValue;
    workshop.factory = req.body.factory.$modelValue;
    workshop.members = {$push: {"members": {
      //req.body.members.$modelValue;
    }}},
    workshop.messages = {$push: {"members": {
      //req.body.messages.$modelValue;
    }}}

    return workshop.save();
  })
  .then(function(workshop){
    res.json(workshop);
  })
  .then(function(workshop) {
    mongoose.connection.close();
  })
  .catch(function(err){
      res.send(err)
  });
}

// create messages and send back all messages after creation
exports.newmessage = function(req, res) {
    //console.log(req.body);
    //create a messages, information comes from AJAX request from Angular
    var promise = Messages.create({
    	title: 		req.body.title.$modelValue,
    	body: 		req.body.body.$modelValue,
    	author: 	req.body.author.$modelValue,
    	isparent: 	false,
    	isfactory: 	false,
    	iscomment: 	false
    })
    .then(function(message) {
        var promise = Workshops.findByIdAndUpdate({'_id': req.params.id},{$push: {"messages": message._id}}).exec()
        .then(function(workshop){
            Workshops.findById({'_id': req.params.id}).populate(['factory','members','messages']).lean().execAsync()
            .then(function(workshop){
                res.json(workshop);
            })
            .catch(function(err){
              res.send(err);
            });
        })
        .catch(function(err){
          res.send(err);
        })
    })
    .catch(function(err){
      res.send(err);
    })

    //mongoose.connection.close();
}
