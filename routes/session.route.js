const express = require('express')
const router = express.Router();

// Import the model
const Session = require('../models/Session.model')

router.post('/new' , async(req, res) => {

    try {
        let {meeting_id} = Math.random().toString(36).substring(2);
        const session = new Session({...req.body,meeting_id:meeting_id})
        await session.save()
        res.json({
            message: 'new session has been created',
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

module.exports = router;