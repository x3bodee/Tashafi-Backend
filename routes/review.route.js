const express = require('express');
const router = express.Router();

// Import the models
const Review = require('../models/Review.model');
const User = require('../models/User.model');


router.post('/new', async (req, res) => {
    try {
        const newReview = new Review(req.body)
        const doctorID = User.findById(req.doctor._id)
        const patientID = User.findById(req.patient._id)
        newReview.doctor = doctorID
        newReview.patient = patientID
        await newReview.save()
        res.status(201).json({
            Review: newReview,
            message: 'new review has been added',
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