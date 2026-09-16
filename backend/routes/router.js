const express = require('express');
const router = express();

router.get('/', (req, res) => {
    res.send('API Rodando!');
});

module.exports = router;