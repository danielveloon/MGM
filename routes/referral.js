// routes/indicado.js
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.post('/:link_indicacao', async (req, res) => {
  const { cpf, birth_date, phone } = req.body;
  const { link_indicacao } = req.params;

  try {
    const result = await db.query(
      'SELECT id FROM referrer WHERE referral_link = $1',
      [link_indicacao]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link inválido ou expirado' });
    }

    const referrer_id = result.rows[0].id;

    await db.query(
      `INSERT INTO referral (referrer_id, cpf, birth_date, phone)
      VALUES ($1, $2, $3, $4)`,
      [referrer_id, cpf, birth_date, phone]
    );

    res.status(201).json({ message: 'Indicado cadastrado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
