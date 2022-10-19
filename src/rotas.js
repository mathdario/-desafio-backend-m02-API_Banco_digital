const express = require("express");
const {
  listarContas,
  criarConta,
  atualizarConta,
  deletarConta,
  deposito,
  sacar,
  transferir,
  saldo,
} = require("./controladores/contas");

const rotas = express();

rotas.get("/contas", listarContas);
rotas.post("/contas", criarConta);
rotas.put("/contas/:numero/usuario", atualizarConta);
rotas.delete("/contas/:numero", deletarConta);
rotas.post("/transacoes/depositar", deposito);
rotas.post("/transacoes/sacar", sacar);
rotas.post("/transacoes/transferir", transferir);
rotas.get("/contas/saldo", saldo);

module.exports = rotas;
