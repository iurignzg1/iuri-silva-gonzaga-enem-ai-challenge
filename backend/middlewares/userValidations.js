const {body} = require("express-validator")

const userCreateValidation = () => {
    return [
        body("nome")
        .isString()
        .withMessage("O nome é obrigatório")
        .isLength({min: 3})
        .withMessage("O Nome precisa ter no mínimo 3 caracteres"),
        body("email")
        .isString()
        .withMessage("O e-mail é obrigatório")
        .isEmail()
        .withMessage("Insira um e-mail válido"),
        body("senha")
        .isString()
        .withMessage("A senha é obrigatória")
        .isLength({min: 6})
        .withMessage("A senha deve conter no mínimo 6 caracteres"),
        body("confirmPassword")
        .isString()
        .withMessage("A confirmação de senha é obrigatória.")
        .custom((value, { req }) => {
          if (value !== req.body.senha) {
           throw new Error("As senhas não são iguais.");
         } 
          return true;
  })
    ]

}
const loginValidation = () => {
    return [ 
        body("email")
        .isString()
        .withMessage("O e-mail é obrigatório")
        .isEmail()
        .withMessage("Insira um e-mail válido"),
        body("senha")
        .isString()
        .withMessage("A senha é obrigatória")

    ]
}

module.exports = {userCreateValidation, loginValidation}