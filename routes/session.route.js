const express = require('express')
const router = express.Router();

// Import the model
const Session = require('../models/Session.model')
const User = require('../models/User.model')

router.post('/new' , async(req, res) => {
    console.log("test")
    try {
        // console.log(req.body.doctor)
        // console.log(req.body.start_time)
        // console.log(req.body.end_time)
        
        if(!req.body.doctor || !req.body.start_time || !req.body.end_time) throw "missing"
        
        const doctor = await User.findById(req.body.doctor).select({"password": 0})
        console.log(doctor)
        if (!doctor) throw "WrongId"
        else if (doctor.userType != 1) throw "notADoctor"
        let meeting_id = Math.random().toString(36).substring(2);
        console.log(meeting_id)


        const session = new Session({ ...req.body , "meeting_id": meeting_id })
        console.log(session)
        await session.save()
        res.json({
            message: 'new session has been created',
        })
    }
    catch (err) {
        if (err == "missing") {
            res.status(400).json({
                name: "MissingData",
                message: "there is missing data",
                url: req.originalUrl
            })
        }else if(err == "WrongId"){
            res.status(400).json({
                name: "WrongData",
                message: "check your submitted data",
                url: req.originalUrl
            })
        }else if(err == "notADoctor"){
            res.status(400).json({
                name: "WrongData",
                message: "the ID is not a doctor id",
                url: req.originalUrl
            })
        }else{
            res.status(401).json({
                name: err.name,
                message: err.message,
                url: req.originalUrl
            })
        }
    }
})

router.post('/edit/:id' , async(req, res) => {

    try {
        console.log(req.body)
        console.log(req.params.id)
        await Session.findByIdAndUpdate(req.params.id,req.body)
        res.json({
            message: 'session has been Editied',
        })
    }
    catch (err) {
        res.status(401).json({
            name: err.name,
            message: err.message,
            url: req.originalUrl
        })
    }
})

router.get('/show/:id' , async(req, res) => {
    try{

        const id = req.params.id;

        const sessions = await Session.find({doctor: id},{"_v":0})
            .populate({
                path: "doctor",
                select: '-password',
                populate : {
                    path : 'specialty',
                    select: 'name'
                }
            })
            
        if (!sessions || !sessions.length) throw "DontExist"
        
        console.log(sessions)

        res.status(200).json({
            message: 'sessions has been found',
            sessions:sessions,
        })
    }catch(err){
        if (err == "DontExist") 
            res.status(404).json({
                name: "DontExist",
                message: "there is no session for this doctor",
                url: req.originalUrl
            })
        else 
        res.status(404).json({
            name: err.name,
            message: err.message,
            url: req.originalUrl
        })
    }

})

module.exports = router;