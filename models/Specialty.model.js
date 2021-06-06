const mongoose = require('mongoose');


const specialtySchema = mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    review_number: {
        type: Integer,
        required: true
    },
    patient: {
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'User',
        required: true
    },
    doctor: {
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'User',
        required: true
    },
    
} , {timestamp : true})



const Specialty = mongoose.model('Specialty', specialtySchema);

module.exports = Specialty;