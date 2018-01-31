var Messages = require('../models/messages.js');
var Workshops = require('../models/workshops.js');
var Profiles = require('../models/profiles.js');
var mongoose = require('mongoose');

/*
 * Serve JSON to our AngularJS client
 */

// get all factories
exports.getall = function(req, res) {

        var promise = Messages.find({isfactory:true}).exec() //only parent factories, no comments

        promise.then(function(factories) {
			res.json(factories);
        })
        .catch(function(err){
            res.send(err);
        })
    }


// get a single factory
exports.single = function(req, res) {

        var promise = Messages.findById(req.params.id).populate('members').exec() //only parent messages, no comments

        promise.then(function(factory) {
			res.json(factory);
        })
        .catch(function(err){
            res.send(err);
        })
}

// exports.search = function(req, res) {
//     var promise = Messages.find({$or:[
//         {body:new RegExp(req.body.searchvalue, "i")},
//         {title:new RegExp(req.body.searchvalue, "i")}
//         ]}).limit(10).sort({hits:-1}).exec();

//     promise.then(function(messages) {
//         //console.log(messages.length);
//         res.json(messages);
//     })
//     .catch(function(err){
//           res.send(err);
//     });
// }

// create factory and send back all factories after creation
exports.postfactory = function(req, res) {

    //create a factories, information comes from AJAX request from Angular
    Messages.create({
    	title: 		req.body.title,
    	body: 		req.body.body,
    	author: 	req.body.author,
    	isparent: 	true,
    	isfactory: 	true,
    	iscomment: 	false
    }, function(err, factories) {
        if (err)
            res.send(err);

        // get and return all the factories after you create another
        Messages.find({isparent:true},function(err, factories) {
            if (err)
                res.send(err)
            res.json(factories);
        });
    });
}

// update a message
exports.updatefactory = function(req, res) {

    var promise = Messages.findById(req.params.id).exec()
	//console.log(req.body);
	promise.then(function(message){

    	message.title			= 		req.body.title.$modelValue;
		message.body			= 		req.body.body.$modelValue;
		message.author			= 		req.body.author.$modelValue;
		// message.creationdate	= 		req.body.creationdate;
		message.lastupdate		= 		new Date();
		// message.isparent		= 		req.body.isparent;
		// message.parent			= 		req.body.parent;
		// message.childs			= 		req.body.childs;
		// message.tags			= 		req.body.tags;
		// message.isfactory		= 		req.body.isfactory;
		// message.iscomment		= 		req.body.iscomment;
		// message.hits			= 		req.body.hits;
        message.members         =       req.body.members.$modelValue;

    	return message.save();
    })
    .then(function(message){
        // Profiles.update(
        //     {'_id': {$in: message.members},'memberof': {$ne: message.id}},
        //     {$push: {'memberof':message.id}},
        //     {'multi': true}
        //     ,function(err,message){
        //     if (err) res.send(err)
                res.json(message);
        //});
    })
    .catch(function(err){
        res.send(err)
    });
}

// delete a message
exports.deletefactory = function(req, res) {
    Messages.remove({
        _id : req.params.id
    }, function(err, factories) {
        if (err)
            res.send(err);

        // get and return all the factories after you create another
        Messages.find({isfactory:true},function(err, factories) {
            if (err)
                res.send(err)
            res.json(factories);
        });
    });
}

// add a comment
// exports.postcomment = function(req, res) {
//         var promise = Messages.findOneAndUpdate({'_id':req.params.id},
//         	{$push: {"childs": {
//         		title: 		req.body.title,
//         		body: 		req.body.body,
//         		author: 	req.body.author,
//         		isparent: 	false,
//         		//parent: 	toObject(req.params.id),
//         		iscomment: 	true,
//       			isfactory: 	false,
//         	}}},
//         	{safe: true, upsert: true, new: true}
//         ).exec()

//         promise.then(function(comments) {
//         	Messages.find({isparent:true},function(err, messages) {
//         		if (err)
//                 	res.send(err)
// 				res.json(messages);
// 			});
//         })
//         .catch(function(err){
//             res.send(err);
//         })
//     }

// delete a comment
// exports.deletecomment = function(req, res) {

//     var promise = Messages.findOne({'childs._id':req.params.id}).exec()

// 	promise.then(function(comment){
//     	comment.childs.id(req.params.id).remove();
//     	return comment.save();
//     })
//     .then(function(comment){
//     	Messages.find({isparent:true},function(err, messages) {
//     		if (err)
//             	res.send(err)
// 			res.json(messages);
//         });
//     })
//     .catch(function(err){
//         res.send(err)
//     });
// }

// update a message
// exports.updatecomment = function(req, res) {

//     var promise = Messages.findOne({'childs._id':req.params.id}).exec()
//     //console.log(req.body);
//     promise.then(function(comment){

//         comment.childs.id(req.params.id).title           =       req.body.title;
//         comment.childs.id(req.params.id).body            =       req.body.body;
//         comment.childs.id(req.params.id).author          =       req.body.author;
//         // comment.childs.id(req.params.id).creationdate    =       req.body.creationdate;
//         // comment.childs.id(req.params.id).lastupdate      =       req.body.lastupdate;
//         // comment.childs.id(req.params.id).isparent        =       req.body.isparent;
//         // comment.childs.id(req.params.id).parent          =       req.body.parent;
//         // comment.childs.id(req.params.id).childs          =       req.body.childs;
//         // comment.childs.id(req.params.id).tags            =       req.body.tags;
//         // comment.childs.id(req.params.id).isfactory       =       req.body.isfactory;
//         // comment.childs.id(req.params.id).iscomment       =       req.body.iscomment;
//         // comment.childs.id(req.params.id).hits            =       req.body.hits;

//         return comment.save();
//     })
//     .then(function(comment){
//             res.json(comment.childs.id(req.params.id));
//     })
//     .catch(function(err){
//         res.send(err)
//     });

// }
// get a single workshop
exports.getworkshop = function(req, res) {

        var promise = Messages.find({'_id': req.params.id}).exec() //only parent messages, no comments

        promise.then(function(workshops) {
            res.json(workshops);
        })
        .catch(function(err){
            res.send(err);
        })
}
