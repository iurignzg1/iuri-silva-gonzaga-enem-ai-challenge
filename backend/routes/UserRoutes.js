const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getCurrentUser, updateProfile } = require("../controllers/UserController");

// Middlewares
const validate = require("../middlewares/handleValidation");
const { userCreateValidation, loginValidation } = require("../middlewares/userValidations");
const authGuard = require("../middlewares/authGuard");

// Executa a rota
router.post("/register", userCreateValidation(), validate, registerUser);
router.post("/login", loginValidation(), validate, loginUser);
router.get("/profile", authGuard, getCurrentUser);
router.put("/profile", authGuard, updateProfile);

module.exports = router;