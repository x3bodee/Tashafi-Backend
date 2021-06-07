const mongoose = require('mongoose');


const reviewSchema = mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    review_number: {
        type: Number,
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



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;