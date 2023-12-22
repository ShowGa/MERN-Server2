const express = require("express");
const app = express();
require("dotenv").config({ path: __dirname + "/.env" });
const bcrupt = require("bcrypt");
const mongoose = require("mongoose");
const authRoute = require("./Routes/index").auth;
const courseRoute = require("./Routes/index").course;
const passport = require("passport");
require("./config/passport")(passport);
const User = require("./Models/index").user;
const Courses = require("./Models/index").course;
const cors = require("cors");

mongoose
  .connect(process.env.MONGODB_CONNECTION)
  .then(() => {
    console.log("Connected to mongoDB");
  })
  .catch((e) => {
    console.log(e);
  });

/*--------------------Middleware-------------------*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Routes - /api/user
app.use("/api/user", authRoute);
// Routes - /api/courses
// course route protected by jwt
// request will be unauthorized when jwt doesn't exsit in request headers
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

app.listen(8080, () => {
  console.log("Server Operating on port 8080");
});
