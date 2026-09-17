const express = require("express");
const router = express.router();

//controller
const {register} = require("../controllers/UserControler");

//routes

route.post("/register", register);

module.exports = router;