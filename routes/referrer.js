// routes/indicador.js
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.post('/link', async (req, res) => {
  const { cpf, birth_date, phone } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO referrer (cpf, birth_date, phone)
      VALUES ($1, $2, $3)
      RETURNING referral_link`,
      [cpf, birth_date, phone]
  );

    const uuid = result.rows[0].referral_link;
    const link = `http://localhost:3000/consulta-fgts/${uuid}`;

    res.json({ link });
  } catch (error) {
    console.error('Erro ao inserir indicador:', error);
    res.status(500).json({ error: 'Erro ao criar indicação' });
  }
});

module.exports = router;
