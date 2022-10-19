const express = require("express");
const rotas = require("./rotas");
const PORTA = 3000;

const app = express();

app.use(express.json());
app.use(rotas);

app.listen(PORTA, () => {
  console.log(`API rodando na porta ${PORTA}`);
});
