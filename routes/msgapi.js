var Messages = require('../models/messages.js');
var mongoose = require('mongoose');
var JSONStream = require('JSONStream');
var moment = require('moment');

/*
 * Serve JSON to our AngularJS client
 */

// get all messages
exports.getall = function(req, res) {

    var promise = Messages.paginate({isparent:true},{page:Number(req.params.page)+1,limit:Number(req.params.limit),sort:{creationdate:'desc'}}) //only parent messages, no comments

    .then(function(messages) {
      //console.log(messages);
      for (var i=0;i<messages.docs.length;i++){
        messages.docs[i].lastupdated = moment(messages.docs[i].lastupdate).fromNow();
        if(messages.docs[i].childs){
          for (var u=0;u<messages.docs[i].childs.length;u++){
            //console.log('do we iterate? '+u);
            messages.docs[i].childs[u].lastupdated = moment(messages.docs[i].childs[u].lastupdate).fromNow();
          }
        }
      }
	    res.json(messages);
    })
    .catch(function(err){
      res.send(err);
    })

}
// experimental pipe stream
exports.getall2 = function(req, res, next) {

      Messages.find({isparent:true})
        // .skip(Number(req.params.page)*10)
        // .limit(Number(req.params.limit))
        .cursor()
        //.pipe(res.type('json'))
        .pipe(JSONStream.stringify())
        .pipe(res)
    }

exports.count = function(req, res, next){
    Messages.count({isparent:true}, function(err,count){
      if(err) console.log(err);
      res.json(count);
    })
}

// get a single message
exports.single = function(req, res) {
    if(req.params.entity=='message') {
        // now increments hits everytime, need to figure this out!
        var promise = Messages.findByIdAndUpdate({'_id': req.params.id},{$inc: {'hits':1}}).exec() //only parent messages, no comments
    }
    if(req.params.entity=='comment') {
        //Messages.findByIdAndUpdate({'_id': req.params.id},{$inc: {'hits':1}});
        var promise = Messages.findOne({'childs._id':req.params.id}).exec() //only parent messages, no comments
    }
    promise
    .then(function(message) {
      message.lastupdated = moment(message.lastupdate).fromNow();
      if(message.childs){
        for (var u=0;u<message.childs.length;u++){
          message.childs[u].lastupdated = moment(message.childs[u].lastupdate).fromNow();
        }
      }
			(req.params.entity=='message') ? res.json(message) : res.json(message.childs.id(req.params.id));
    })
    .catch(function(err){
        res.send(err);
        //res.render('error',err);
    });
}

exports.search = function(req, res) {
    // var promise = Messages.find({$or:[
    //     {body:new RegExp(req.body.value.$modelValue, "i")},
    //     {title:new RegExp(req.body.value.$modelValue, "i")}
    //     ]}).limit(10).sort({hits:-1}).exec();
    var promise = Messages.paginate(
      {$or:[
        {body:new RegExp(req.body.value, "i")},
        {title:new RegExp(req.body.value, "i")}
      ]
      //,sort:{'hits':-1}
      }
      ,{page:Number(req.params.page)+1,limit:Number(req.params.limit),sort:{hits:-1}}
    )

    .then(function(messages) {
        messages.searchvalue = req.body.value;
        console.log(messages.docs.length);
        res.json(messages);
    })
    // .then(function(messages) {
    //   mongoose.connection.close();
    // })
    .catch(function(err){
          res.send(err);
    });
}

// create messages and send back all messages after creation
exports.postmessage = function(req, res) {
    //console.log(req.body);
    //create a messages, information comes from AJAX request from Angular
    Messages.create({
    	title: 		req.body.title.$modelValue,
    	body: 		req.body.body.$modelValue,
    	author: 	req.body.author.$modelValue,
    	isparent: 	true,
    	isfactory: 	false,
    	iscomment: 	false
    }, function(err, message) {
        if (err) res.send(err)
        // // get and return all the messages after you create another
        // //Messages.find({isparent:true},function(err, messages) {
        Messages.paginate({isparent:true},{page:1,limit:10,sort:{creationdate:'desc'}})
            //if (err) res.send(err);
        .then(function(messages){
            res.json(messages);
        })
        .catch(function(err){
          res.send(err);
        });
    });
    //mongoose.connection.close();
}

// update a message
exports.updatemessage = function(req, res) {

    var promise = Messages.findById(req.params.id).exec()
	console.log(req.body);
	promise.then(function(message){

    message.title			= 		req.body.title.$modelValue;
		message.body			= 		req.body.body.$modelValue;
		message.author			= 		req.body.author.$modelValue;
		message.creationdate	= 		message.creationdate;
		message.lastupdate		= 		new Date();
		// message.isparent		= 		req.body.isparent;
		// message.parent			= 		req.body.parent;
		// message.childs			= 		req.body.childs;
		// message.tags			= 		req.body.tags;
		// message.isfactory		= 		req.body.isfactory;
		// message.iscomment		= 		req.body.iscomment;
		// message.hits			= 		req.body.hits;

    	return message.save();
    })
    .then(function(message){
		  res.json(message);
    })
    .then(function(messages) {
      mongoose.connection.close();
    })
    .catch(function(err){
        res.send(err)
    });
    //mongoose.connection.close();
}

// delete a message
exports.deletemessage = function(req, res) {
    var promise = Messages.remove({_id : req.params.id})
    .then(function(data) {
      // res.json(data);
      var promise = Messages.paginate({isparent:true},{page:Number(req.params.page)+1,limit:Number(req.params.limit),sort:{creationdate:'desc'}})
      .then(function(messages){
          res.json(messages);
      })
      .catch(function(err){
          res.send(err);
      });
    })
    .catch(function(err){
      res.send(err);
    });
    //mongoose.connection.close();
}

// add a comment
exports.postcomment = function(req, res) {
        console.log(req.body);
        var promise = Messages.findOneAndUpdate({'_id':req.params.id},
        	{$push: {"childs": {
        		title: 		req.body.title,
        		body: 		req.body.body,
        		author: 	req.body.author,
        		isparent: 	false,
        		parent:     req.params.id,
        		iscomment: 	true,
      			isfactory: 	false,
            lastupdate: new Date()
        	}}},
        	{safe: true, upsert: true, new: true}
        ).exec()

        promise.then(function(comments) {
        	// Messages.find({isparent:true},function(err, messages) {
        	// 	if (err) res.send(err)
				  //   res.json(messages);
			    // });
          var promise = Messages.paginate({isparent:true},{page:Number(req.params.page)+1,limit:Number(req.params.limit),sort:{creationdate:'desc'}})
          .then(function(messages){
              res.json(messages);
          })
          .catch(function(err){
              res.send(err);
          });
        })
        // .then(function(messages) {
        //   mongoose.connection.close();
        // })
        .catch(function(err){
            res.send(err);
        });
    }

// delete a comment
exports.deletecomment = function(req, res) {

    var promise = Messages.findOne({'childs._id':req.params.id}).exec()

	promise.then(function(comment){
    	comment.childs.id(req.params.id).remove();
    	return comment.save();
    })
    .then(function(comment){
    	// Messages.find({isparent:true},function(err, messages) {
    	// 	if (err) res.send(err);
			//   res.json(messages);
      // });
      var promise = Messages.paginate({isparent:true},{page:Number(req.params.page)+1,limit:Number(req.params.limit),sort:{creationdate:'desc'}})
      .then(function(messages){
          res.json(messages);
      })
      .catch(function(err){
          res.send(err);
      });
    })
    // .then(function(messages) {
    //   mongoose.connection.close();
    // })
    .catch(function(err){
        res.send(err)
    });
}

// add a comment
exports.postcommentsingle = function(req, res) {
    var promise = Messages.findOneAndUpdate({'_id':req.params.id},
        {$push: {"childs": {
            title:      req.body.title,
            body:       req.body.body,
            author:     req.body.author,
            isparent:   false,
            //parent:   toObject(req.params.id),
            iscomment:  true,
            isfactory:  false,
        }}},
        {safe: true, upsert: true, new: true}
    ).exec()

    promise.then(function(comments) {
        // return all messages or just one?
        Messages.findById({'_id':req.params.id},function(err, message) {
            if (err) res.send(err)
            res.json(message);
        });
    })
    // .then(function(messages) {
    //   mongoose.connection.close();
    // })
    .catch(function(err){
        res.send(err);
    });
}

// delete a comment and return single
exports.deletecommentsingle = function(req, res) {

    var promise = Messages.findOne({'childs._id':req.params.id}).exec()

    promise.then(function(comment){
        comment.childs.id(req.params.id).remove();
        return comment.save();
    })
    .then(function(comment){
        console.log(comment);
        Messages.findById({'_id':comment._id},function(err, message) {
            if (err) res.send(err);
            res.json(message);
        });
    })
    // .then(function(messages) {
    //     mongoose.connection.close();
    // })
    .catch(function(err){
        res.send(err)
    });
}

// update a message
exports.updatecomment = function(req, res) {

    var promise = Messages.findOne({'childs._id':req.params.id}).exec()
    promise.then(function(comment){

        comment.childs.id(req.params.id).title           =       req.body.title.$modelValue;
        comment.childs.id(req.params.id).body            =       req.body.body.$modelValue;
        comment.childs.id(req.params.id).author          =       req.body.author.$modelValue;
        comment.childs.id(req.params.id).creationdate    =       comment.childs.id(req.params.id).creationdate;
        comment.childs.id(req.params.id).lastupdate      =       new Date();
        // comment.childs.id(req.params.id).isparent        =       req.body.isparent;
        // comment.childs.id(req.params.id).parent          =       req.body.parent;
        // comment.childs.id(req.params.id).childs          =       req.body.childs;
        // comment.childs.id(req.params.id).tags            =       req.body.tags;
        // comment.childs.id(req.params.id).isfactory       =       req.body.isfactory;
        // comment.childs.id(req.params.id).iscomment       =       req.body.iscomment;
        // comment.childs.id(req.params.id).hits            =       req.body.hits;

        return comment.save();
    })
    .then(function(comment){
            res.json(comment.childs.id(req.params.id));
    })
    // .then(function(messages) {
    //   mongoose.connection.close();
    // })
    .catch(function(err){
        res.send(err)
    });
}

// update a message
exports.addthumb = function(req, res) {

    var promise = Messages.findOneAndUpdate( {_id: req.params.id}, { $addToSet: {thumbs: req.params.uid } } )
    .then(function(messages){
        Messages.paginate({isparent:true},{page:Number(req.params.page),limit:Number(req.params.limit),sort:{creationdate:'desc'}})
        .then(function(messages){
            res.json(messages);
        })
        .catch(function(err){
          res.send(err);
        });
    })
    .catch(function(err){
        res.send(err)
    });
}

// update a message
exports.removethumb = function(req, res) {

    var promise = Messages.findOneAndUpdate( {_id: req.params.id}, { $pullAll: {thumbs: [req.params.uid] } } )
    .then(function(messages){
        Messages.paginate({isparent:true},{page:Number(req.params.page),limit:Number(req.params.limit),sort:{creationdate:'desc'}})
        .then(function(messages){
            res.json(messages);
        })
        .catch(function(err){
          res.send(err);
        });
    })
    .catch(function(err){
        res.send(err)
    });
}

exports.frontpage = function(req, res) {

    var promise = Messages.find({isfrontpage:true}).limit(3).sort({datecreated:-1}).exec() //only parent messages, no comments

    promise.then(function(messages) {
      res.json(messages);
    })
    // .then(function(messages) {
    //   mongoose.connection.close();
    // })
    .catch(function(err){
      res.send(err);
    });
}
