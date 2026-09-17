const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/UserController");

// Middlewares
const validate = require("../middlewares/handleValidation")
const {userCreateValidation, loginValidation} = require("../middlewares/userValidations")

// Executa a rota
router.post("/register",userCreateValidation(), validate, registerUser);
router.post("/login",loginValidation(), validate, loginUser);

module.exports = router;