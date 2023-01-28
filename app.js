
const express = require('express');
require("dotenv").config();

const connectDB = require("./db/connect")
const mongoose = require('mongoose')
mongoose.set('strictQuery', false);

const session = require('express-session')
//const MongoStore = require('connect-mongo')(session);

const User = require('./Schemas/UserSchema')

const app = express()
let cors = require('cors')

//defining port
const PORT = process.env.PORT || 8000
// Set EJS as templating engine
app.set('view engine', 'ejs');

//middlewares
app.use(express.json()) 
app.use(express.urlencoded({ extended: true}))

//app.use("/api", authRouter);

//Connect to db
const MongoURI = `mongodb+srv://lenson:Lenson27@cluster0.jfibqlk.mongodb.net/profile`

mongoose.connect(MongoURI, {useNewUrlParser:true}).then(()=>{
console.log("Connected to MongoDb")
}).catch((err)=>{
 console.log(err) 
})


// let conn = mongoose.connection ;





app.get("/", (req,res)=>{
    return res.send("This is my Home route")
})

app.get("/registration", (req, res)=>{
    return res.render("registration")
})

app.post("/register", (req, res)=>{
    res.send({
        status: 200,
        message: req.body

    })
})

//listening to the port
app.listen(PORT, ()=>{
    console.log("Server is running")
})