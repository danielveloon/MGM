const express = require('express');
require('dotenv').config();
const app = express();

const referrerRoutes = require('./routes/referrer');
const referralRoutes = require('./routes/referral');

app.use(express.json());

app.use('/referrer', referrerRoutes); // POST /referrer/link
app.use('/referral', referralRoutes); // POST /referral/:referral_link

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
