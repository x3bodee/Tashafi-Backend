const mongoose = require('mongoose');



const bookingSchema = mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    charged: {
        type: Boolean,
        default:false // false == not paid --- true == paid
    },
    status: {
        type: Boolean,
        default:false // false == open --- true == closed
    },
    patient: {
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'User',
        required: true
    },
    meeting_id: {
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'Session',
        required: true
    },
    
} , {timestamp : true})



const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;