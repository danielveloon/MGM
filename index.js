const express = require('express');
const path = require('path');
const db = require('./db/connection');
require('dotenv').config();

const app = express();

const referrerRoutes = require('./routes/referrer');
const referralRoutes = require('./routes/referral');
const fgtsRoutes = require('./routes/fgts');

// Middleware
app.use(express.json());
app.use(express.static('public')); // Servir arquivos estáticos da pasta public

// Rotas da API
app.use('/referrer', referrerRoutes);
app.use('/referral', referralRoutes);
app.use('/fgts', fgtsRoutes);

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para página Indique e Ganhe
app.get('/indique-e-ganhe', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'indique-e-ganhe.html'));
});

// Rota padrão para consulta FGTS (sem UUID)
app.get('/consulta-fgts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'consulta-fgts.html'));
});

// Rota com UUID para consulta FGTS - deve vir por último para não interferir com arquivos estáticos
app.get('/consulta-fgts/:uuid', async (req, res) => {
    const { uuid } = req.params;

    // Validação básica do formato UUID antes de consultar o banco
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
        return res.status(400).send('UUID inválido');
    }

    try {
        const result = await db.query(
            'SELECT id FROM referrer WHERE referral_link = $1',
            [uuid]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Link inválido ou expirado');
        }

        res.sendFile(path.join(__dirname, 'public', 'consulta-fgts.html'));
    } catch (err) {
        console.error('Erro ao verificar UUID:', err);
        res.status(500).send('Erro ao processar solicitação');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
