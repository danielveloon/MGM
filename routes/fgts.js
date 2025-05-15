const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const path = require('path');

// Rota para servir a página de consulta FGTS com UUID
router.get('/:uuid', async (req, res) => {
    const { uuid } = req.params;

    try {
        // Verifica se o UUID existe no banco de dados
        const result = await db.query(
            'SELECT id FROM referrer WHERE referral_link = $1',
            [uuid]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Link inválido ou expirado');
        }

        // Se o UUID for válido, serve a página com o UUID
        res.sendFile(path.join(__dirname, '..', 'public', 'consulta-fgts.html'));
    } catch (err) {
        console.error('Erro ao verificar UUID:', err);
        res.status(500).send('Erro ao processar solicitação');
    }
});

// Rota para processar a consulta de FGTS
router.post('/consulta-fgts', async (req, res) => {
    const { cpf, birth_date, phone, uuid } = req.body;

    try {
        let referrer_id = null;

        // Se tiver UUID, verifica e obtém o referrer_id
        if (uuid) {
            const result = await db.query(
                'SELECT id FROM referrer WHERE referral_link = $1',
                [uuid]
            );

            if (result.rows.length > 0) {
                referrer_id = result.rows[0].id;
            }
        }

        // Registra a consulta no banco de dados
        await db.query(
            `INSERT INTO fgts_queries (cpf, birth_date, phone, referrer_id)
            VALUES ($1, $2, $3, $4)`,
            [cpf, birth_date, phone, referrer_id]
        );

        // Formata o número do WhatsApp (remove caracteres não numéricos)
        const whatsappNumber = '5511912345678'; // Número que receberá as consultas
        const message = `Olá! Gostaria de consultar meu FGTS.
CPF: ${cpf}
Data de Nascimento: ${birth_date}
Telefone: ${phone}${referrer_id ? '\nConsulta via indicação' : ''}`;

        // Cria o link do WhatsApp
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        // Retorna o link do WhatsApp
        res.json({
            whatsapp_link: whatsappLink
        });
    } catch (err) {
        console.error('Erro ao processar consulta:', err);
        res.status(500).json({ error: 'Erro ao processar sua solicitação' });
    }
});

module.exports = router;