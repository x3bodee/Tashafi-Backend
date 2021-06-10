require('dotenv').config();
const express = require('express')
const app = express()
require('dotenv').config();
const PORT = process.env.PORT || 5000

const cors = require('cors');
const mongoose = require('mongoose')
const path = require('path');

mongoose.connect(process.env.MONGODBD,
    { useUnifiedTopology: true, useNewUrlParser: true }, () => {
        console.log(`mongo db connect with the server`)
    })


// to use the body
app.use(express.urlencoded({ extended: false }))
app.use(express.json());

app.use(cors());

app.use(express.static(path.join(__dirname, "build")));


// routes 

app.use('/api/v1/booking',require('./routes/booking.route'))
app.use('/api/v1/session',require('./routes/session.route'))
app.use('/api/v1/review' ,require('./routes/review.route'))
app.use('/api/v1/specialty' ,require('./routes/specialty.route'))
app.use('/api/v1/auth',require('./routes/auth.route'))


// app.get('/', (req, res) => {

//     res.json({ msg: "test" })

// })


app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });

app.listen(PORT, () => console.log(`server run on ${PORT}`))
