const mongoose = require('mongoose');


const specialtySchema = mongoose.Schema({
    
    name: {
        type : String , 
        required: true
    },
    
} , {timestamp : true})



const Specialty = mongoose.model('Specialty', specialtySchema);

module.exports = Specialty;