const mongoose = require('mongoose');



const sessionSchema = mongoose.Schema({
    start_time: {
        type: Date,
        required: true
    },
    doctor: {
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'User',
        required: true
    },
    end_time: {
        type: Date,
        required: true ,
    },
    status: {
        type: Boolean,
        default:false // false == show --- true == dont show
    },
    meeting_id: {
        type : String , 
        required: true
    },
    
} , {timestamp : true})



const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;