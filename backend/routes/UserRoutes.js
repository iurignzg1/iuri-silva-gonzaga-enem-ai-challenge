const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/UserController");

// Middlewares
const validate = require("../middlewares/handleValidation")
const {userCreateValidation, loginValidation, userUpdateValidation} = require("../middlewares/userValidations")
const authGuard = require('../middlewares/authGuard');
const { getCurrentUser, updateProfile } = require('../controllers/UserController');

// Executa a rota
router.post("/register",userCreateValidation(), validate, registerUser);
router.post("/login",loginValidation(), validate, loginUser);
router.get('/profile', authGuard, getCurrentUser);
router.put('/profile', authGuard, userUpdateValidation(), validate, updateProfile);


module.exports = router;