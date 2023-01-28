
const validator = require('validator')

const cleanUpandValidate = ({name, email, password, phone, username}) => {

    return new Promise((resolve, reject)=>{
        if(!email || !name || !password || !phone || !username)
            reject("Missing credentials");
        if(typeof email !== 'string')
            reject("Email not a string");
        if(typeof name !== 'string')
            reject("Name not a string");
        if(typeof password !== 'string')
            reject("Password not a string");
        if(typeof phone !== 'string')
            reject("Phone not a string");
        if(typeof username !== 'string')
            reject("Username not a string");

        if(!validator.isEmail(email))
            reject('Please enter Email in correct format');

        if(username.length <3 || username.length>25)
            reject("Username should be between 3 to 25 characters");

        if(password.length <3 || password.length >75)
            reject("Password should be between 3 to 75 characters");
        
        resolve();

        
    })
   


}

module.exports = cleanUpandValidate;