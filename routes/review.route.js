const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')


// Import the models
const Review = require('../models/Review.model');
const User = require('../models/User.model');


router.post('/new', async (req, res) => {
    try {
        console.log("inside review add new")
        console.log(req.body)
        const newReview = new Review(req.body)
        const doctorID = await User.findOne(req.doctor)
        const patientID = await User.findOne(req.patient)
        
        await newReview.save()
        console.log("Done")
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

// all data by patient id then papoulate dr and show the FNAME LNAME 

router.get('/patient/:id', async (req, res) => {
    try {
        const review = await Review.find({ patient: req.params.id }).populate({ path: "doctor", select: "Fname Lname" })
        if (!review) {
            throw new Error("you don't have any reviews yet")
        }

        console.log(review)
        res.status(200).json(review)
    }
    catch (err) {
        res.status(400).json({
            name: err.name,
            message: err.message,
            url: req.originalUrl
        })
    }
})


// all review by doctorID


router.get('/doctor/:id', async (req, res) => {
    try {
        const review = await Review.find({ doctor: req.params.id }).populate({ path: "patient", select: "Fname Lname" })

        if (!review) {
            throw new Error("this doctor does not have any reviews yet")
        }
        console.log(review)
        res.status(200).json(review)
    } catch (error) {
        res.status(400).json({
            name: error.name,
            message: error.message,
            url: req.originalUrl
        })
    }
})


// update review

router.put('/edit/:id', async (req, res) => {
    try {

        const reviewID = req.params.id
        const review = await Review.findByIdAndUpdate(reviewID, req.body)
        if (!review) {
            throw new Error("review does not exist")

        }
        await review.save()
        res.status(200).json({
            Review: review,
            message: 'review has been updated',
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