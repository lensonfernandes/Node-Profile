const express = require("express");
require("dotenv").config();
const validator = require("validator");

const connectDB = require("./db/connect");
const mongoose = require("mongoose");
const session = require("express-session");
const jwt = require("jsonwebtoken")

const mongoDBsession = require("connect-mongodb-session")(session);

mongoose.set("strictQuery", false);

//const MongoStore = require('connect-mongo')(session);

const UserSchema = require("./Schemas/UserSchema");
const profileSchema = require("./models/ProfileModel")

const app = express();
let cors = require("cors");
const {cleanUpandValidate, generateToken, sendVerificationEmail} = require("./utils/AuthUtil");

const bcrypt = require("bcrypt");
const isAuth = require("./middleware/authMiddleware");

//defining port
const PORT = process.env.PORT || 8000;
const saltRounds = 9;

// Set EJS as templating engine
app.set("view engine", "ejs");

const MongoURI = `mongodb+srv://lenson:Lenson27@cluster0.jfibqlk.mongodb.net/profile`;
//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const store = new mongoDBsession({
  uri: MongoURI,
  collection: "sessions",
});

app.use(
  session({
    secret: "This is Len",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//app.use("/api", authRouter);

//Connect to db

mongoose
  .connect(MongoURI, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to MongoDb");
  })
  .catch((err) => {
    console.log(err);
  });

// let conn = mongoose.connection ;

app.get("/", (req, res) => {
  return res.send("This is my Home route");
});

app.get("/registration", (req, res) => {
  return res.render("registration");
});
app.get("/login", (req, res) => {
  return res.render("login");
});

app.get("/profile", isAuth, (req, res) => {
  return res.render("profile");
});

app.post("/logout", isAuth, (req, res) => {
  console.log(req.session);
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/login");
  });
});

app.post("/register", async (req, res) => {
  const { username, name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // console.log(hashedPassword);

  try {
    await cleanUpandValidate({ name, username, hashedPassword, email });
  } catch (err) {
    console.log(err)
    return res.send({
      status: 402,
      error: err,
    });
  }

  let user = new UserSchema({
    name: name,
    email: email,
    password: hashedPassword,

    username: username,
  });

  let userExists;

  try {
    userExists = await UserSchema.findOne({ email });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Internal Server error,please try after some time",
      error: error,
    });
  }

  if (userExists) {
    return res.send({
      status: 403,
      message: "User already exists",
    });
  }

  //generate a token
  const verificationToken = generateToken(email)
  //console.log(verificationToken)

  try {
    const userDb = await user.save();
    sendVerificationEmail(email, verificationToken)
   // console.log(userDb);
    return res.status(200).redirect("/login");
  } catch (err) {
    console.log(err)
    return res.send({
      status: 400,
      message: "Registraion - Failed",
      error: err,
    });
  }
});

app.post("/login", async (req, res) => {
  const { loginId, password } = req.body;
  //   console.log("line139")
  //   console.log(req.session)
  //   console.log("line140")
  //   console.log(req)

  if (!loginId || !password)
    return res.send({
      status: 400,
      message: "missing credentials",
    });

  if (typeof loginId !== "string")
    return res.send({
      status: 400,
      message: "LoginId not a string",
    });

  if (typeof password !== "string")
    return res.send({
      status: 400,
      message: "Password not a string",
    });

  if (validator.isEmail(loginId)) {
    let email = loginId;
    try {
      let userDb = await UserSchema.findOne({ email });
      // console.log("Line170");
      // console.log(userDb);

      if (!userDb) {
        return res.send({
          status: 401,
          message: "User not found",
        });
      }

      let result = await bcrypt.compare(password, userDb.password);
      //   console.log("line 174");
      //   console.log(result);
      if (result) {
        req.session.isAuth = true;
        req.session.user = {
          username: userDb.username,
          email: userDb.email,
          userId: userDb._id,
        };

        return res.status(200).redirect("/profile");
      } else {
        return res.send({
          status: 400,
          message: "Password mismatch",
        });
      }
    } catch (err) {
      return res.send("Internal server error");
    }
  } else {
    let username = loginId;
    try {
      let userDb = await UserSchema.findOne({ username });
      // console.log("Line166");
      // console.log(userDb);

      if (!userDb) {
        return res.send({
          status: 401,
          message: "User not found",
        });
      }

      let result = await bcrypt.compare(password, userDb.password);
      console.log("line 170");
      console.log(result);

      if (result) {
        req.session.isAuth = true;
        req.session.user = {
          username: userDb.username,
          email: userDb.email,
          userId: userDb._id,
        };

        return res.status(200).redirect("/profile");
      } else {
        return res.send({
          status: 400,
          message: "Password mismatch",
        });
      }
    } catch (err) {
      return res.send("Internal server error");
    }
  }

  res.send("Success");
});

app.post("/fetch", isAuth, async (req, res)=>{
 // console.log(req.body)

let profile = new profileSchema({
  username: req.session.user.username,
  email: req.session.user.email
})

let userDb = await UserSchema.findOne({email:req.session.user.email});

profile.name = userDb.name;


try{
  let profileDb = await profile.save();
  return res.send({
    status: 201,
    message:"Profile saved",
    data:profileDb ,
    
  })
}
catch(err){
  return res.send({
    status: 500,
    message:"Database error",
    error: err
  })
}

})

app.post("/save", isAuth, async (req, res)=>{
  console.log(req.body);

  const name = req.body.name;
  const username = req.body.username;
  const email = req.body.email;
  const phone = req.body.phone;
  const password = req.body.password;
  const college = req.body.college;
  const state = req.body.state;
  const country = req.body.country;
  let profile = new profileSchema({
    username: req.session.user.username,
    email: req.session.user.email,
    phone: phone,
    name:name,
    password: password,
    college: college,
    country: country,
    state: state

  })
  
//console.log(name, username, email, phone, password, college, state, country)
let userDb = await UserSchema.findOne({email:req.session.user.email});

profile.name = userDb.name;


try{
  let profileDb = await profile.save();
  return res.send({
    status: 201,
    message:"Profile saved",
    data:profileDb ,
    
  })
}
catch(err){
  return res.send({
    status: 500,
    message:"Database error",
    error: err
  })
}

})

//listening to the port
app.listen(PORT, () => {
  console.log("Server is running");
});
