const express = require('express');
const router = express.Router();

const SimuladoController = require('../controllers/SimuladoController');
const authGuard = require('../middlewares/authGuard');

router.get('/historico', authGuard, SimuladoController.listarHistorico);
router.get('/:dia', SimuladoController.gerarSimulado);
router.post('/finalizar', authGuard, SimuladoController.finalizarSimulado);

module.exports = router;