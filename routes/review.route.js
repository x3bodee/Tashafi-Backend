const express = require('express');
const router = express.Router();

// Import the models
const Review = require('../models/Review.model');
const User = require('../models/User.model');


router.post('/new', async (req, res) => {
    try {
        const newReview = new Review(req.body)
        newReview.patient = req.patient._id
        newReview.doctor = req.doctor._id
        await newReview.save()
        res.json({
            Review: newReview,
            message: 'new review has been added',
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

