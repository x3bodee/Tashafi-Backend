const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')


// Import the models
const Review = require('../models/Review.model');
const User = require('../models/User.model');


router.post('/new', async (req, res) => {
    try {
        const newReview = new Review(req.body)
        const doctorID = await User.findOne(req.doctor)
        const patientID = await User.findOne(req.patient)

        await newReview.save()
        res.status(201).json({
            Review: newReview,
            message: 'new review has been added',
            name: doctorID,
            nameP: patientID

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


// show all reviews
router.get('/reviews', async (req, res) => {
    try {
        const allReviews = await Review.find()
        res.status(200).json({ allReviews })
    }
    catch (err) {
        res.status(401).json({
            name: err.name,
            message: err.message,
            url: req.originalUrl
        })
    }
})


// all review by patientID

// router.get('review/patient/:id' async (req, res) => {
//     try {

//     }
//     catch (err) {
//         res.status(400).json({
//             name: err.name,
//             message: err.message,
//             url: req.originalUrl
//         })
//     }
// })



// all review by doctorID

// router.get('review/doctor/:id' async (req, res) => {
//     try {

//     }
//     catch (err) {
//         res.status(400).json({
//             name: err.name,
//             message: err.message,
//             url: req.originalUrl
//         })
//     }
// })

// update review



// delete review
router.delete('/delete/:id', async (req, res) => {
    try {
        const reviewID = req.params.id
        const review = await Review.findByIdAndDelete(reviewID)
        if (!review) {
            throw new Error("review does not exist")
        }
        res.status(200).json({
            message: "this Review has been deleted Successfully"
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











module.exports = router;