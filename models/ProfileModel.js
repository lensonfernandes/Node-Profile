
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const profileModel = new Schema({
    name:{
        type:String,

    },
    username:{
        type:String,

    },
    email:{
        type:String,

    },
    phone:{
        type:String,

    },
    state:{
        type:String,

    },
    country:{
        type:String,

    },
    college:{
        type:String,

    },
 

})

module.exports = mongoose.model("profile", profileModel)