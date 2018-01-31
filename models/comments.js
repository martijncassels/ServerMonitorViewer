var mongoose = require('mongoose')
var Schema = mongoose.Schema;
mongoose.Promise = require('bluebird');

var commentSchema = mongoose.Schema({
		    title: {type : String, default: ''},
		    body: {type : String, default: ''},
		    author: {type : String, default: ''},
		    creationdate: {type: Date, default: Date.now},
		    lastupdate: {type: Date, default: Date.now},
		    isparent: {type : Boolean, default: true},
		    parent: [{type: Schema.Types.ObjectId, default:null}],
		    childs: [commentSchema],
		    tags: [String],
		    isfactory: {type : Boolean, default: false},
		    iscomment: {type : Boolean, default: false},
		    hits: Number
		});

module.exports = mongoose.model('messages', messageSchema);