const db = require('./db/connection');

(async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('Conectado com sucesso:', result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Erro ao conectar no banco:', err);
    process.exit(1);
  }
})();
