const express = require('express')
const router = express.Router();

// Import the model
const Booking = require('../models/Booking.model')
const User = require('../models/User.model')
const Session = require('../models/Session.model')

// adding new booking
router.post('/new' , async(req, res) => {
    try {
        const sID= req.body.meeting_id
        const sDescritption= req.body.description
        const sPatient= req.body.patient
        console.log(sID)
        console.log(sDescritption)
        console.log(sPatient)
        if(!sID || !sDescritption || !sPatient) throw "missing data"

        const book = new Booking({description:sDescritption ,patient:sPatient , meeting_id:sID})
        const booking=  await book.save()
          if(!booking ) throw "booking not saved" 

        const sessionID = await Session.findByIdAndUpdate({_id:sID} , {status:true}).populate({ 
           path:'doctor' , select : '-password'
       })
        console.log(sessionID)
       if(!sessionID) throw "not found"
        //  sessionID.status=true
        //  await sessionID.save()
         console.log("Hi")
      
      const doctor = await User.findByIdAndUpdate(sessionID.doctor._id , {$push:{booked:booking}})

       if(!doctor) throw "not found"
       const patientID = await User.findByIdAndUpdate({_id:sPatient},{$push:{booking:booking}})
       console.log("line 29")
       if(!patientID) throw "not found"
    //    console.log(patientID)
        res.json({
            booking: booking,
            message: 'new booking successfully created',
        })
    }
    catch (err) {
        if (err=="missing data")
        res.status(406).json({
            name: "missing data",
            message: "there is missing data ",
            url: req.originalUrl
        })
        else if ( err=="booking not saved")
            res.status(400).json({
                name: "not saved",
                message: "Something went wrong while saving",
                url: req.originalUrl
        })
        else if ( err=="not found")
        res.status(404).json({
            name: "not found",
            message: "there is no record with this ID",
            url: req.originalUrl
    })
       else 
       res.status(401).json({
        name: err.name,
        message: err.message,
        url: req.originalUrl
    })
    }
    
})


router.post('/finddoctors/' , async(req, res) => {
    try{

        let city = req.body.city
        let specialty = req.body.specialty

        // check if specialty has been send or not
        if (!specialty) throw "missingData"
        console.log(specialty)

        // check if city has been send or not
        if (!city) throw "missingData"
        console.log(city)
        
        // always convert to lower case
        city=city.toLowerCase()
        
        
        // let doctors =[]
        const doctors = await User.find({ city: city, specialty: specialty, userType:1},{password:0}).populate("specialty","name").populate("booked")
        
        console.log(doctors)

        if(!doctors || !doctors.length) throw "DontExist"


        res.status(200).json({
            doctors:doctors,
            message: 'doctors has been found',
        })

    }catch(err){
        if (err == "missingData") 
            res.status(400).json({
                name: "MissingData",
                message: "there is missing data",
                url: req.originalUrl
            })
        else if ( err == "DontExist") 
            res.status(404).json({
                name: "DontExist",
                message: "there is no doctors match",
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

router.get('/finddoctor/:id' , async(req, res) => {
    try{

        let id=req.params.id

        const doctor = await User.findById(id).select({"password": 0})
        
        // if the docctor == null or undefind then throw erorr
        if (!doctor) throw "DontExist"
        
        // if userType !- to 1 then this user is not a doctor so throw erorr
        if (doctor.userType != 1) throw "notADoctor"

        console.log(doctor)
        res.status(200).json({
            doctor: doctor,
            message: 'doctor has been found',
        })
    }catch(err){
        
        if( err == "DontExist" )
            res.status(404).json({
                name: "DontExist",
                message: "this record don't exist",
                url: req.originalUrl
            })
        else if( err == "notADoctor" )
            res.status(406).json({
                name: "NotADoctor",
                message: "there is no doctor with this id",
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