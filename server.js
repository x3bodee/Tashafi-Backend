require('dotenv').config();
const express = require('express')
const app = express()
require('dotenv').config();
const PORT = process.env.PORT

const cors = require('cors');
const mongoose = require('mongoose')


mongoose.connect(process.env.MONGODB,
    { useUnifiedTopology: true, useNewUrlParser: true }, () => {
        console.log(`mongo db connect with the server`)
    })


// to use the body
app.use(express.urlencoded({ extended: false }))
app.use(express.json());

// routes 

// app.use('/api/v1/booking',require('./routes/booking.route'))
app.use('/api/v1/session',require('./routes/session.route'))
app.use('/api/v1/review' ,require('./routes/review.route'))
app.use('/api/v1/specialty' ,require('./routes/specialty.route'))
app.use('/api/v1/auth',require('./routes/auth.route'))


app.get('/', (req, res) => {

    res.json({ msg: "test" })

})

app.listen(PORT, () => console.log(`server run on ${PORT}`))
