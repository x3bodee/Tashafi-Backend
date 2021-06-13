const express = require('express')
const router = express.Router();
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')

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


// update booking

router.put('/edit/:id', async (req, res) => {
    try {

        const bookingID = req.params.id
        const updatedBooking = await Booking.findByIdAndUpdate(bookingID, req.body)
        if (!updatedBooking) {
            throw new Error("booking does not exist")

        }
        await updatedBooking.save()
        res.status(200).json({
            Booking: updatedBooking,
            message: 'booking has been updated'
        })
    }
    catch (err) {
        res.status(400).json({
            name: err.name,
            message: err.message,
            url: req.originalUrl
        })
    }
})

//ALL booking 
router.get('/allbookings', async (req, res) => {
    try {
        const allbooking = await Booking.find()
        res.status(200).json({ allbooking })
    }
    catch (err) {
        res.status(401).json({
            name: err.name,
            message: err.message,
            url: req.originalUrl
        })
    }
})

///Single Booking
router.get('/oneBooking/:id', async (req, res) => {
    try {
        //booking id
        const booking_id=ObjectId(req.params.id)
        //find by booking id
        const onebooking = await Booking.findById(booking_id)
        //response
        res.status(200).json({
            booking: onebooking,
            message: 'booking has been found by booking id.',
        })
    }
    catch (err) {
        //not found response
        res.status(404).json({
            name: err.name,
            message: err.message,
            url: req.originalUrl
        })
    }
})

//Show booking by user id
router.get('/show/:id' , async(req, res) => {
    try{
        //user id
        let user_id=ObjectId(req.params.id)
        //find user by user id
        const user = await User.findById(user_id)
        //if not found user
        if(!user){
            throw "Not Existing user"
        }
        //doctor
        const doctor = await User.find({_id:user_id, userType:1},{password:0}).populate("booked")
        //patient
        const patient = await User.findById(user_id).populate("booking")
        // if user is doctor
        if (doctor){
            res.status(200).json({
                booked: doctor,
                message: 'doctor bookings has been found',
            })
        }else{
            //if user is patient
            res.status(200).json({
                booked: patient,
                message: 'patient booking has been found',
            })
        }
    }catch(err){
        //Not found user response
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

        const doctor = await User.findById(id).select({"password": 0}).populate("specialty")
        
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

router.delete('/:id', async ( req, res ) => {
    try{

        const id = req.params.id;
        const oID = mongoose.Types.ObjectId(id);
        
        console.log("--------------------------")
        
        const patient = await User.updateMany ( { booking: oID }  , { $pull : { booking: id } } )
        
        if ( patient.nModified == 0 ) throw "patient dont have booking" 
        // console.log(patient)
        
        console.log("--------------------------")
        const doctor = await User.updateMany ( { booked: oID }  , { $pull : { booked: id } } )
        if ( doctor.nModified == 0 ) throw "doctor dont have booking" 
        // console.log(doctor)
        
        console.log("--------------------------")
        const deleted = await Booking.findByIdAndDelete(oID);
        console.log(deleted)
        if(!deleted) throw "Not Found"
        
        const session = await Session.findByIdAndUpdate({_id:deleted.meeting_id},{status:false})
        console.log(session)
        
        if (!session) throw "Not Found"

        res.status(200).json({
            message: 'booking has been deleted',
        })
    }catch(err){

        if( err = "doctor dont have booking") 
            res.status(406).json({
                name: "Invalid booking",
                message: "doctor dont have this bookin",
                url: req.originalUrl
            })
        else if( err = "patient dont have booking") 
            res.status(406).json({
                name: "Invalid booking",
                message: "patient dont have this bookin",
                url: req.originalUrl
            })
        else if( err = "Not Found") 
            res.status(404).json({
                name: "Not Found",
                message: "there is no booking or session with this ID",
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

