const express = require('express');
const router = express.Router();

const SimuladoController = require('../controllers/SimuladoController');

router.get('/:dia', SimuladoController.gerarSimulado);

module.exports = router;