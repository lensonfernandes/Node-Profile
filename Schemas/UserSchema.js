const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: { type: String, required: true, unique: true },
 
  password: { type: String, required: true },
  emailAuthenticated:{
    type:Boolean,
    required: true,
    default:false,
  }
}, {strict: false});

let user = mongoose.model('user', userSchema);
module.exports = user;

// Name
// Username (Unique)
// Email (Unique)
// Phone number
// Password (hashed it using bcrypt)
