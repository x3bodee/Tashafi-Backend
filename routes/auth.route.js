const express = require('express');
const router = express.Router();
const User = require('../models/User.model')
const bcrypt = require('bcryptjs');



// register Route 
router.post('/', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.json({
        message: "thank you for register" 
        , user: newUser 
        , success : true
    })
    } catch (err) {
        res.status(401).json({name : err.name ,
         message:err.message,
        url : req.originalUrl
        })
    }

})

//login 




module.exports=router 