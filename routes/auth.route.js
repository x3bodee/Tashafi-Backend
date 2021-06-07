const express = require('express');
const router = express.Router();
const User = require('../models/User.model')
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
require('dotenv').config();



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


// login
router.post('/login' , async (req, res) => {
    const {email , password } = req.body
    try {
        let user = await User.findOne({email: email})
        if(user == null) throw new Error("this email is not in our db")
        if(!bcrypt.compareSync(password , user.password)) throw new Error("password is wrong !! ")
         user.password = undefined
         let token = jwt.sign({user} ,
            process.env.SECRETKEY , {
             expiresIn : 60*60*1000
         })
        res.json({message : "login seccuss " , token})
 
    } catch (err) {
        res.status(401).json({name : err.name ,
         message:err.message,
        url : req.originalUrl
        })
    }

})


module.exports=router 