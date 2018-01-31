/* Fake test data script for MongoBooster
faker.locale = "nl"

const STEPCOUNT = 1; //total 10 * 100 = 1000

function isRandomBlank(blankWeight) {
    return Math.random() * 100 <= blankWeight;
};

for (let i = 0; i < 10; i++) {
    db.getCollection("profiles").insertMany(
        _.times(STEPCOUNT, () => {
            return {
                "firstname": faker.name.firstName(),
                "lastname": faker.name.lastName(),
                "password": faker.internet.password(),
                "skills": [
                    {name: '1', value: Math.floor((Math.random() * 3) + 1)},
                    {name: '2', value: Math.floor((Math.random() * 3) + 1)},
                    {name: '3', value: Math.floor((Math.random() * 3) + 1)},
                    {name: '4', value: Math.floor((Math.random() * 3) + 1)},
                    {name: '5', value: Math.floor((Math.random() * 3) + 1)},
                ],
                "username": faker.internet.userName()
            }
        })
    )
    console.log(`${(i + 1) * STEPCOUNT} docs inserted`);
}
*/

var mongoose = require('mongoose')
var Schema = mongoose.Schema;
mongoose.Promise = require('bluebird');
var passportLocalMongoose = require('passport-local-mongoose');

//var profileSchema = mongoose.Schema({
var Profile = new Schema({
			//_id: String,
		    //username: { type:String,minlength:5},
		    username: String,
		    salt: String,
		    hash: String,
		    firstname: String,
		    lastname: String,
		    password: String,
		    active: {type: Boolean, default: false},
		    deleted: {type: Boolean, default: false},
		    creationdate: {type: Date, default: Date.now},
		    lastlogin: {type: Date, default: Date.now},
				bio: {type: String, default: null},
		    avatar: {
		    	URL: String,
		    	gender: String,
		    	avatarID: Number
		    },
		    //avatar: {type: String},
		    skills: [{
		    	name: {type:String}, value: {type:Number, default: 0}, _id: false
		  //   	name: {type:String, default: '1'}, value: {type: Number, default: 1}, _id: false},
		  //   	{name: {type:String, default: '2'}, value: {type: Number, default: 1}, _id: false},
		  //   	{name: {type:String, default: '3'}, value: {type: Number, default: 1}, _id: false},
		  //   	{name: {type:String, default: '4'}, value: {type: Number, default: 1}, _id: false},
				// {name: {type:String, default: '5'}, value: {type: Number, default: 1}, _id: false
		    }],
		    memberof: [{type: Schema.Types.ObjectId, ref: 'profiles'}],
		});

Profile.plugin(passportLocalMongoose);

//module.exports = mongoose.model('profiles', profileSchema);
module.exports = mongoose.model('profiles', Profile);
