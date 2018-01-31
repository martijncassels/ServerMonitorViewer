
var 	mongoose 						= require('mongoose'),
			//mongoosePaginate 		= require('mongoose-paginate'),
			//moment 							= require('moment'),
			Schema 							= mongoose.Schema;
mongoose.Promise 					= require('bluebird');

//moment().format();

var	messages 							= mongoose.model('messages').schema,
		profiles 							= mongoose.model('profiles').schema;

var workshopSchema = mongoose.Schema({
			creationdate: {type: Date, default: Date.now},
			lastupdate: {type: Date, default: Date.now},
			factory: [{type: Schema.Types.ObjectId, ref: 'messages'}], //factory
			members: [{type: Schema.Types.ObjectId, ref: 'profiles'}], //team
			messages: [{type: Schema.Types.ObjectId, ref: 'messages'}] //pm's or msgboard
		});

//messageSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('workshops', workshopSchema);
