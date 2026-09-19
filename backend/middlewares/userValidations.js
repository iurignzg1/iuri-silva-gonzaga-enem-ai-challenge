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
const userUpdateValidation = () => {
    return [
        body("nome").optional().isLength({min: 3}).withMessage("O Nome precisa ter no mínimo 3 caracteres"),
        body("pesos.matematica").optional().isNumeric().withMessage("A matemática deve ser um número"),
        body("pesos.natureza").optional().isNumeric().withMessage("A natureza deve ser um número"),
        body("pesos.humanas").optional().isNumeric().withMessage("As humanas deve ser um número"),
        body("pesos.linguagens").optional().isNumeric().withMessage("As linguagens deve ser um número"),
        body("pesos.redacao").optional().isNumeric().withMessage("A redação deve ser um número")
    ]
}
module.exports = {userCreateValidation, loginValidation, userUpdateValidation}