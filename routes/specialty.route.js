const express = require('express')
const router = express.Router();

// Import the model
const Specialty = require('../models/Specialty.model')
const User = require('../models/User.model')


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
    console.log("in")
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




router.delete('/:id', async (req, res) => {
    try {
        const specialtyID = req.params.id
        const specialty = await Specialty.findByIdAndDelete(specialtyID)
        
        if (!specialty) throw "DontExist"
        
        const doctor = await User.updateMany({specialty:specialtyID},{specialty:null},{ multi: true})

        console.log("done update")
        console.log(doctor)

        res.status(200).json({
            message: 'specialty has been deleted',
        })
    }catch (err) {
        if(err == "DontExist") 
            res.status(404).json({
                name: "DontExist",
                message: "there is no specialty with this ID",
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