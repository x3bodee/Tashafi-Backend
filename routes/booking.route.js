const express = require('express')
const router = express.Router();
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')

// Import the model
const Booking = require('../models/Booking.model')
const User = require('../models/User.model')
const Session = require('../models/Session.model')
const Review = require('../models/Review.model')

// adding new booking
router.post('/new', async (req, res) => {
    try {
        const sID = req.body.meeting_id
        const sDescritption = req.body.description
        const sPatient = req.body.patient
        console.log(sID)
        console.log(sDescritption)
        console.log(sPatient)
        if (!sID || !sDescritption || !sPatient) throw "missing data"

        const book = new Booking({ description: sDescritption, patient: sPatient, meeting_id: sID })
        const booking = await book.save()
        if (!booking) throw "booking not saved"

        const sessionID = await Session.findByIdAndUpdate({ _id: sID }, { status: true }).populate({
            path: 'doctor', select: '-password'
        })
        console.log(sessionID)
        if (!sessionID) throw "not found"
        //  sessionID.status=true
        //  await sessionID.save()
        console.log("Hi")

        const doctor = await User.findByIdAndUpdate(sessionID.doctor._id, { $push: { booked: booking } })

        if (!doctor) throw "not found"
        const patientID = await User.findByIdAndUpdate({ _id: sPatient }, { $push: { booking: booking } })
        console.log("line 29")
        if (!patientID) throw "not found"
        //    console.log(patientID)
        res.json({
            booking: booking,
            message: 'new booking successfully created',
        })
    }
    catch (err) {
        if (err == "missing data")
            res.status(406).json({
                name: "missing data",
                message: "there is missing data ",
                url: req.originalUrl
            })
        else if (err == "booking not saved")
            res.status(400).json({
                name: "not saved",
                message: "Something went wrong while saving",
                url: req.originalUrl
            })
        else if (err == "not found")
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
        const booking_id = ObjectId(req.params.id)
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

function convertDate(start, end) {
    let s = new Date(start)
    let e = new Date(end)
    let sn = s.toDateString().split(" "); // thu sun mon  2021 5 12
    let en = e.toDateString().split(" ");


    let sd = s.toTimeString().split(" ")[0]
    let ed = e.toTimeString().split(" ")[0]

    let date = { date: sn[1] + " " + sn[2] + " " + sn[3], day: en[0], start_time: sd, end_time: ed }
    console.log(date)
    return date;
}

//Show booking by user id
router.get('/show/:id', async (req, res) => {
    try {
        //user id
        let user_id = ObjectId(req.params.id)
        //find user by user id
        const user = await User.findById(user_id)
        //if not found user
        if (!user) {
            throw "Not Existing user"
        }
        //doctor
        const doctor = await User.find({ _id: user_id, userType: 1 }, { password: 0 })
            .populate(
                {
                    path: "booked specialty",
                    populate: {
                        path: 'meeting_id patient',
                        select: '-password',
                    }
                })
        //patient
        const patient = await User.findById(user_id)
            .populate(
                {
                    path: "booking",
                    select: '-password',
                    populate: {
                        path: 'meeting_id',
                        populate: {
                            path: 'doctor',
                            select: '-password',
                            populate: {
                                path: 'specialty',
                                select: 'name',
                            }
                        }

                    }
                })
        // if user is doctor
        if (doctor && doctor.length) {
            console.log("1")
            // console.log(doctor[0].Fname)
            let doc = {
                Fullname: doctor[0].Fname + " " + doctor[0].Lname,// 
                email: doctor[0].email,
                id: doctor[0]._id, //  
                specialty: doctor[0].specialty.name, //  doctor.booked.specialty.name
            }
            // console.log(doc)
            console.log("2")
            let booked = [];
            
            doctor[0].booked.sort((a, b) => {
                var dateA = new Date(a.meeting_id.start_time), dateB = new Date(b.meeting_id.start_time);
                return dateA - dateB;
            });
            
            doctor[0].booked.forEach((ele, i) => {
                let done = {
                    status: ele.status,
                    patient: {
                        Fullname: ele.patient.Fname + " " + ele.patient.Lname,
                        email: ele.patient.email,
                        id: ele.patient._id, //  
                    },
                    meeting: {
                        date: convertDate(ele.meeting_id.start_time, ele.meeting_id.end_time),
                        id: ele.meeting_id._id,
                        link: ele.meeting_id.meeting_id,
                    }
                }
                booked.push(done)
            })
            console.log(booked)
            res.status(200).json({
                message: 'doctor bookings has been found',
                doctor: doc,
                booked: booked,

            })
        } else {
            console.log("1")
            // console.log(doctor[0].Fname)
            let pat = {
                Fullname: patient.Fname + " " + patient.Lname,// 
                email: patient.email,
                id: patient._id, //  
            }
            console.log(pat)
            console.log("2")
            let booking = [];
            
            patient.booking.sort((a, b) => {
                var dateA = new Date(a.meeting_id.start_time), dateB = new Date(b.meeting_id.start_time);
                return dateA - dateB;
            });

            patient.booking.forEach((ele, i) => {
                let done = {
                    status: ele.status,
                    doctor: {
                        Fullname: ele.meeting_id.doctor.Fname + " " + ele.meeting_id.doctor.Lname,
                        email: ele.meeting_id.doctor.email,
                        id: ele.meeting_id.doctor._id, //  
                        specialty: ele.meeting_id.doctor.specialty.name
                    },
                    meeting: {
                        date: convertDate(ele.meeting_id.start_time, ele.meeting_id.end_time),
                        id: ele.meeting_id._id,
                        link: ele.meeting_id.meeting_id,
                    }
                }
                booking.push(done)
                console.log(done)
            })

            //if user is patient
            res.status(200).json({
                message: 'patient booking has been found',
                patient: pat,
                booking: booking,
            })
        }
    } catch (err) {
        //Not found user response
        res.status(401).json({
            name: err.name,
            message: err.message,
            url: req.originalUrl
        })
    }
})

router.post('/finddoctors/', async (req, res) => {
    try {

        let city = req.body.city
        let specialty = req.body.specialty

        // check if specialty has been send or not
        if (!specialty) throw "missingData"
        console.log(specialty)

        // check if city has been send or not
        if (!city) throw "missingData"
        console.log(city)

        // always convert to lower case
        city = city.toLowerCase()


        // let doctors =[]
        const doctors = await User.find({ city: city, specialty: specialty, userType: 1 }, { password: 0 }).populate("specialty", "name").populate("booked")

        console.log(doctors)

        if (!doctors || !doctors.length) throw "DontExist"


        res.status(200).json({
            doctors: doctors,
            message: 'doctors has been found',
        })

    } catch (err) {
        if (err == "missingData")
            res.status(400).json({
                name: "MissingData",
                message: "there is missing data",
                url: req.originalUrl
            })
        else if (err == "DontExist")
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

router.get('/finddoctor/:id', async (req, res) => {
    try {

        let id = req.params.id

        const doctor = await User.findById(id).select({ "password": 0 }).populate("specialty")

        // if the docctor == null or undefind then throw erorr
        if (!doctor) throw "DontExist"

        // if userType !- to 1 then this user is not a doctor so throw erorr
        if (doctor.userType != 1) throw "notADoctor"

        console.log(doctor)
        res.status(200).json({
            doctor: doctor,
            message: 'doctor has been found',
        })
    } catch (err) {

        if (err == "DontExist")
            res.status(404).json({
                name: "DontExist",
                message: "this record don't exist",
                url: req.originalUrl
            })
        else if (err == "notADoctor")
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

router.delete('/:id', async (req, res) => {
    try {

        const id = req.params.id;
        const oID = mongoose.Types.ObjectId(id);

        console.log("--------------------------")

        const patient = await User.updateMany({ booking: oID }, { $pull: { booking: id } })

        if (patient.nModified == 0) throw "patient dont have booking"
        // console.log(patient)

        console.log("--------------------------")
        const doctor = await User.updateMany({ booked: oID }, { $pull: { booked: id } })
        if (doctor.nModified == 0) throw "doctor dont have booking"
        // console.log(doctor)

        console.log("--------------------------")
        const deleted = await Booking.findByIdAndDelete(oID);
        console.log(deleted)
        if (!deleted) throw "Not Found"

        const session = await Session.findByIdAndUpdate({ _id: deleted.meeting_id }, { status: false })
        console.log(session)

        if (!session) throw "Not Found"

        res.status(200).json({
            message: 'booking has been deleted',
        })
    } catch (err) {

        if (err = "doctor dont have booking")
            res.status(406).json({
                name: "Invalid booking",
                message: "doctor dont have this bookin",
                url: req.originalUrl
            })
        else if (err = "patient dont have booking")
            res.status(406).json({
                name: "Invalid booking",
                message: "patient dont have this bookin",
                url: req.originalUrl
            })
        else if (err = "Not Found")
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


function calulateRatiing(reviews) {
    const len = reviews.length;
    let sum = 0;
    // console.log("len: "+len)
    // console.log(data)
    reviews.forEach((ele) => {
        // console.log("ele :");
        // console.log(ele);
        sum += ele.review_number;
    })
    let rate = Math.round(sum / len);
    console.log("Rate#####: " + rate)
    return rate;
}

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

router.get('/doctorprofile/:id', async (req, res) => {
    try {
        let id = req.params.id
        console.log("inside doctorprofile")

        const doctorr = await User.findById(id).select({ "password": 0 }).populate("specialty")
        // if the docctor == null or undefind then throw erorr
        if (!doctorr) throw "DontExist"
        // if userType !- to 1 then this user is not a doctor so throw erorr
        if (doctorr.userType != 1) throw "notADoctor"

        console.log("doctor Done")
        const review = await Review.find({ doctor: id }).populate({ path: "patient", select: "Fname Lname" })

        if (!review) {
            throw new Error("this doctor does not have any reviews yet")
        }
        console.log("reivew Done")

        const sessions = await Session.find({ doctor: id }, { "_v": 0 })
            .populate({
                path: "doctor",
                select: '-password',
                populate: {
                    path: 'specialty',
                    select: 'name'
                }
            })

        if (!sessions || !sessions.length) throw "DontExist"
        console.log("sessions done")



        sessions.sort((a, b) => {
            var dateA = new Date(a.start_time), dateB = new Date(b.start_time);
            return dateA - dateB;
        });


        const doctorRate = calulateRatiing(review);
        const sessions_date = prepare_sessions(sessions);

        // console.log(doctorr)
        // console.log(sessions)
        // console.log(review)

        // res.status(200).json(review)
        res.status(200).json({
            doctor: doctorr,
            sessions: sessions_date,
            reviews: review,
            doctorRate: doctorRate,
            message: 'doctor has been found',
        })
    } catch (err) {

        if (err == "DontExist")
            res.status(404).json({
                name: "DontExist",
                message: "this record don't exist",
                url: req.originalUrl
            })
        else if (err == "notADoctor")
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

