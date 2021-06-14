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

function prepare_sessions(sessions) {
    let session = [...sessions]
    let arr = [];
    console.log("---------------------------")
    session.forEach((ele) => {
        let start = new Date(ele.start_time)
        let end = new Date(ele.end_time)
        let sn = start.toDateString().split(" ");
        let en = start.toDateString().split(" ");
        // console.log(sn)
        // console.log(en)

        let s = start.toTimeString().split(" ")[0]
        let e = end.toTimeString().split(" ")[0]

        let date = { date: sn[1] + " " + sn[2] + " " + sn[3], day: en[0], start: s, end: e, session_id: ele._id, meeting_id: ele.meeting_id }
        // console.log(date)
        arr.push(date)
        return date;
    })
    console.log(arr)
    return arr;
}

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
        sessions.sort((a, b) => {
            var dateA = new Date(a.start_time), dateB = new Date(b.start_time);
            return dateA - dateB;
        });
        let session = prepare_sessions(sessions);
        res.status(200).json({
            message: 'sessions has been found',
            sessions:session,
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