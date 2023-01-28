const express = require("express");
require("dotenv").config();
const validator = require("validator");

const connectDB = require("./db/connect");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const session = require("express-session");
//const MongoStore = require('connect-mongo')(session);

const UserSchema = require("./Schemas/UserSchema");

const app = express();
let cors = require("cors");
const cleanUpandValidate = require("./utils/AuthUtil");

const bcrypt = require("bcrypt");

//defining port
const PORT = process.env.PORT || 8000;
const saltRounds = 9;

// Set EJS as templating engine
app.set("view engine", "ejs");

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//app.use("/api", authRouter);

//Connect to db
const MongoURI = `mongodb+srv://lenson:Lenson27@cluster0.jfibqlk.mongodb.net/profile`;

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

app.post("/register", async (req, res) => {
  const { username, name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log(hashedPassword);

  try {
    await cleanUpandValidate({ name, username, hashedPassword, email });
  } catch (err) {
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

  try {
    const userDb = await user.save();
    console.log(userDb);
    return res.status(200).redirect("/login");
  } catch (err) {
    return res.send({
      status: 400,
      message: "Registraion - Failed",
      error: err,
    });
  }
});

app.post("/login", async (req, res) => {
  const { loginId, password } = req.body;

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
      console.log("Line170");
      console.log(userDb);

      if (!userDb) {
        return res.send({
          status: 401,
          message: "User not found",
        });
      }

      let result = await bcrypt.compare(password, userDb.password);
      console.log("line 174");
      console.log(result);
      if (result) {
        return res.send({
          status: 200,
          message: "Login Success",
        });
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
      console.log("Line166");
      console.log(userDb);

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
        return res.send({
          status: 200,
          message: "Login Success",
        });
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

//listening to the port
app.listen(PORT, () => {
  console.log("Server is running");
});
