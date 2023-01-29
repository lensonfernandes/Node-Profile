
const validator = require('validator')
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer")

const cleanUpandValidate = ({name, email, hashedPassword,  username}) => {

    return new Promise((resolve, reject)=>{
        if(!email || !name || !hashedPassword  || !username)
            reject("Missing credentials");
        if(typeof email !== 'string')
            reject("Email not a string");
        if(typeof name !== 'string')
            reject("Name not a string");
        if(typeof hashedPassword !== 'string')
            reject("Password not a string");
     
        if(typeof username !== 'string')
            reject("Username not a string");

        if(!validator.isEmail(email))
            reject('Please enter Email in correct format');

        if(username.length <3 || username.length>25)
            reject("Username should be between 3 to 25 characters");

        if(hashedPassword.length <3 || hashedPassword.length >75)
            reject("Password should be between 3 to 75 characters");
        
        resolve();

        
    })
   


}

const generateToken = (email) =>{
  const JWT_TOKEN =   jwt.sign({email:email}, "This is Len", {expiresIn:"7d"})
  return JWT_TOKEN
}

const sendVerificationEmail = (email, verificationToken) => {

    console.log(email, verificationToken);
    let mailer = nodemailer.createTransport({
        host:"smtp:gmail.com",
        port:465,
        secure:true,
        service:"Gmail",
        auth:{
            user:"gowhiteferns@gmail.com",
            pass:"lhcvphdghhdwhvww"
        }
    })

    let mailOptions ={
        from:"My Profile",
        to: email,
        subject: "Email verification",
        html:`Click <a href="http://localhost:8000/verify/${verificationToken}">Here </a>`
    }


    mailer.sendMail(mailOptions, function(err, response){
        if(err) throw err;
        else console.log("Mail sent")
    })
}

module.exports = {cleanUpandValidate, generateToken, sendVerificationEmail};