const express = require('express');
const router = express.Router();
const User = require('../models/User.model')
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { ObjectId } = require('mongodb');
require('dotenv').config();




// register Route 
router.post('/signup', async (req, res) => {
    try {
       console.log(req.body)
       req.body.userType=parseInt(req.body.userType);
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
    console.log("email",email)

    console.log("password",password)
    try {
        let user = await User.findOne({email: email})
        if(user == null) throw "Invalid email or password !!"
        if(!bcrypt.compareSync(password , user.password)) throw "Invalid email or password !!!"
         user.password = undefined
         let token = jwt.sign({user} ,
            process.env.SECRETKEY , {
             expiresIn : 60*60*1000
             
         }) 
         console.log(user._id)
        res.json({message : "login seccuss " , token , "userID":user._id})
 
    } catch (err) {
        if (err == "Invalid email or password !!")
        res.status(404).json({name : err.name ,
            message:"there is no such user",
           url : req.originalUrl
           })
        else if (err == "Invalid email or password !!!")
        res.status(406).json({name : err.name ,
            message:"ether email or password is wrong",
           url : req.originalUrl
           })
        else
        res.status(401).json({name : err.name ,
         message:err.message,
        url : req.originalUrl
        })
    }

})
// logout
router.post('/logout' , async (req, res) => {
    res.json({message : "logout seccuss " , token:""})

})

//update
router.put('/update/:id' , async function(req, res){
    var conditions = {
        _id : ObjectId(req.params.id),
        Fname:req.body.Fname,
        Lname:req.body.Lname,
        email:req.body.email,
        password:req.body.password,
        gender:req.body.gender,
        location:req.body.location,
        city:req.body.city
    };
    try{
        let user = await User.findOne({_id: conditions._id});
        user.Fname=conditions.Fname;
        user.Lname=conditions.Lname;
        user.email=conditions.email;
        user.password=conditions.password;
        user.gender=conditions.gender;
        user.location=conditions.location;
        user.city=conditions.city;
        await user.save();
        res.json({
            message: "thank you for update"
            , user: user
            , success : true
        })
    }catch(err){
        res.status(404).json({name : err.name ,
            message:err.message,
            url : req.originalUrl
        })
    }
})

//delete
router.delete('/delete/:id' , async function(req, res){
    var id = ObjectId(req.params.id);
    try{
        let user = await User.deleteOne({_id: id});

        res.json({
            message: "thank you for delete"
            , user: user
            , success : true
        })
    }catch(err){
        res.status(404).json({name : err.name ,
            message:err.message,
            url : req.originalUrl
        })
    }
})


module.exports=router 