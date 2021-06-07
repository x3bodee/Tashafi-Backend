const express = require('express')
const router = express.Router();

// Import the model
const Specialty = require('../models/Specialty.model')


// add a new specialty 

router.post('/new', async (req, res) => {
    try {
        const newSpecialty = new Specialty(req.body)
        await newSpecialty.save()
        res.json({
            specialty: newSpecialty,
            message: 'new specialty has been created',
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


// show all Specialties
router.get('/specialties', async (req, res) => {
    try {
        const allSpecialties = await Specialty.find()
        res.status(200).json({ allSpecialties })
    }
    catch (err) {
        res.status(401).json({
            name: err.name,
            message: err.message,
            url: req.originalUrl
        })
    }
})



// single specialty

router.get('/:id', async (req, res) => {
    try {
        const specialtyID = req.params.id
        const specialty = await Specialty.findById(specialtyID)
        if (!specialty) {
            throw new Error("specialty does not exsist.")
        }
        res.status(201).json(specialty)

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