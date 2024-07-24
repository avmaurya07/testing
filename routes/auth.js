const express = require("express");
const User = require("../models/User");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const JWT_SECRET = "Harryisagoodboy"; //auth token secret

//ROUTE 1:create a user /api/auth/createuser
router.post(
  "/createuser",
  //validator for correct formate
  [
    body("name", "Enter valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Enter a valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    //if error in filling the data it will return the bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //to check unique user
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ error: "User already exist" });
      }
      //salting
      const salt = "$2a$10$4OivDm0lB1d0PB0OybGza7";
      const secPass = await bcrypt.hash(req.body.password, salt);
      // to create the user

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      //for creating a auth token
      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);

    
      res.json({ authtoken });
      console.log("User Regestered Sucessfully");
    } catch (error) {
      res.status(500).send("Internal server error ocurred");
    }
  }
);

//ROUTE 2: to authanticate a user /api/auth/login

router.post(
  "/login",
  //validator for correct formate
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    //if error in filling the data it will return the bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      //to check user exist or not
      let user = await User.findOne({ email });
      //if user does not exist
      if (!user) {
        return res.status(400).json({ error: "invalid email/password" });
      }
      //to compare entered password with the database
      const passwordCompare = await bcrypt.compare(password, user.password);
      //if password is wrong
      if (!passwordCompare) {
        return res.status(400).json({ error: "invalid email/password" });
      }
      //for creating a auth token
      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);

      res.json({ authtoken });
    } catch (error) {
      res.status(500).send("Internal server error ocurred");
    }
  }
);

//ROUTE 3: to get user details  /api/auth/getuser

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId)
      .select("-password")
      .select("-date")
      .select("-_id")
      .select("-__v");
    res.send(user);
  } catch (error) {
    res.status(500).send("Internal server error ocurred");
  }
});
module.exports = router;
