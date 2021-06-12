const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = mongoose.Schema({
    Fname: {
        type: String,
        required: true
    },
    Lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true ,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    userType: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    specialty:{
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'Specialty'
    },
    booking : [{
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'Booking'
    }],
    booked : [{
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'Booking'
    }]
} , {timestamp : true})

userSchema.pre("save" , function (next , done) {
    console.log("pre save user")
    let salt = bcrypt.genSaltSync()
    let hash = bcrypt.hashSync(this.password , salt)
    this.password = hash
    next()
})


const User = mongoose.model('User', userSchema);

module.exports = User; 
