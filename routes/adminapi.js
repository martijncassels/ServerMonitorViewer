var Promise = require('bluebird');
var Messages = require('../models/messages.js');
var Profiles = require('../models/profiles.js');
var mongoose = require('mongoose');

Promise.promisifyAll(mongoose);

var db = mongoose.connection;

/*
 * Serve JSON to our AngularJS client
 */

// get all factories
exports.msgstats = function(req, res) {
        Promise.props({
            messages: Messages.collection.stats(),
            msgmaxhits: Messages
                .aggregate([{
                    $group: {
                        _id: '$hits',
                        count: { $sum: 1}
                    }
                }])
                .execAsync(),
            msgmaxmembers: Messages
                .aggregate([{
                    $unwind: '$members'
                },{
                    $group: {
                        _id: '$_id',
                        count: { $sum: 1}
                }
                },{
                    $lookup: {
                        from: "Profiles",
                        localField: "_id",
                        foreignField: "_id",
                        as: "profile"
                }
                }])
                .execAsync(),
            msgcreated: Messages
                .aggregate([{
                    $group: {
                        // https://docs.mongodb.com/manual/reference/operator/aggregation/dateToString/#exp._S_dateToString
                        _id: {date: {$dateToString:{format:"%H",date: '$creationdate'}}},
                        //_id : { month: { $month: "$creationdate" }, day: { $dayOfMonth: "$creationdate" }, year: { $year: "$creationdate" } },
                        //averageQuantity: { $avg: "$hits" },
                        count: { $sum: 1}
                    }
                }])
                .execAsync(),
            profiles: Profiles.collection.stats(),
            prostats: Profiles.find().execAsync()
        })
        .then(function(stats) {
			res.json(stats);
        })
        .catch(function(err){
            res.send(err);
        })
    }

// get all factories
exports.prostats = function(req, res) {

        var promise = Profiles.count().exec() //only parent factories, no comments

        promise.then(function(stats) {
            res.json(stats);
        })
        .catch(function(err){
            res.send(err);
        })
    }