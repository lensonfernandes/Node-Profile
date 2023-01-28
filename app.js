
const express = require('express');
require("dotenv").config();

const connectDB = require("./db/connect")
const mongoose = require('mongoose')
mongoose.set('strictQuery', false);

const session = require('express-session')
//const MongoStore = require('connect-mongo')(session);

const UserSchema = require('./Schemas/UserSchema')

const app = express()
let cors = require('cors');
const cleanUpandValidate = require('./utils/AuthUtil');

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

app.post("/register", async (req, res)=>{

const {username, name, email, password, phone} = req.body;
try{
 await cleanUpandValidate({name, username, password, email, phone})
}
catch(err){
    return res.send({
        status:402,
        error:err,
    })

}


let user = new UserSchema({
    name: name,
    email: email,
    password:password,
    phone:phone,
    username:username,

})

try{
  const userDb = await  user.save(); 
  console.log(userDb)
  return  res.send({
        status: 200,
        message: "Registraion - Success",
        data:userDb

    })
}
catch(err)
{
    return res.send({
        status: 400,
        message: "Registraion - Failed",
        error:err

    })

}


   
})

app.post("/login", (req, res)=>{
    res.render("login")
})

//listening to the port
app.listen(PORT, ()=>{
    console.log("Server is running")
})