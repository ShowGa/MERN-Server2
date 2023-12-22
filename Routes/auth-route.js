const router = require("express").Router();
const { registerValidation, loginValidation } = require("../validation");
const User = require("../Models/index").user;
const jwt = require("jsonwebtoken");

/*---------------Middleware----------------*/
router.use((req, res, next) => {
  console.log("Receive auth router request !");
  next();
});

/*-----------------testAPI------------------*/

router.get("/testAPI", (req, res) => {
  return res.send("Successfully connect to auth/testAPI route !");
});

/*-----------------Register-----------------*/

// .post(/register)
router.post("/register", async (req, res) => {
  console.log("/register receive request !");
  // Register validation
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check User overlap
  const emailOverlap = await User.findOne({ email: req.body.email });
  if (emailOverlap) {
    return res.status(400).send("Email exist !");
  } else {
    // Register New User
    let { username, email, password, role } = req.body;
    const newUser = new User({ username, email, password, role });
    try {
      let savedUser = await newUser.save();
      return res.send({
        msg: "Register successfully",
        savedUser,
      });
    } catch (e) {
      res.status(500).send(e);
    }
  }
});

/*--------------Authentication--------------*/
// .post(/login)
router.post("/login", async (req, res) => {
  // loginValidation
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // Check User exsit
  const findUser = await User.findOne({ email: req.body.email });
  if (!findUser) {
    return res
      .status(401)
      .send(
        "User not found ! Please check your account or enroll an account !"
      );
  }

  // check login success, Sign jwt
  findUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(err);

    if (isMatch) {
      const tokenObject = { _id: findUser._id, email: findUser.email };
      const token = jwt.sign(tokenObject, process.env.SECRET);
      return res.send({
        message: "Login successfully !",
        token: "JWT " + token,
        user: findUser,
      });
    } else {
      return res.status(401).send("Password incorrect !");
    }
  });
});

// .post(/login)

module.exports = router;
