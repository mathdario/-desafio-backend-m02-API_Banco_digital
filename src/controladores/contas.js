const {
  contas,
  saques,
  depositos,
  transferencias,
  banco,
} = require("../bancodedados");

const { format } = require("date-fns");

let id = 1;

const listarContas = (req, res) => {
  const { senha_banco } = req.query;
  if (senha_banco !== banco.senha) {
    return res
      .status(401)
      .json({ mensagem: "A senha do banco informada é inválida!" });
  } else {
    res.send(contas);
  }
};

const criarConta = (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } =
    req.body.usuario;

  const cpfNaoEUnico = contas.find((conta) => {
    return conta.usuario.cpf === cpf;
  });

  const emailNaoEUnico = contas.find((conta) => {
    return conta.usuario.email === email;
  });

  if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
    return res
      .status(400)
      .json({ mensagem: `Todos os campos são obrigatórios` });
  }

  if (cpfNaoEUnico || emailNaoEUnico) {
    return res
      .status(403)
      .json({ mensagem: `Já existe uma conta com o cpf ou e-mail informado!` });
  }

  const data = {
    numero: id,
    saldo: 0,
    usuario: {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha,
    },
  };

  contas.push(data);

  id++;

  return res.status(201).send();
};

const atualizarConta = (req, res) => {
  const { numero } = req.params;

  const { nome, cpf, data_nascimento, telefone, email, senha } =
    req.body.usuario;

  const contaExistente = contas.find(
    (conta) => conta.numero === Number(numero)
  );

  const cpfNaoEUnico = contas.find((conta) => {
    return conta.usuario.cpf === cpf;
  });

  if (cpfNaoEUnico) {
    return res
      .status(403)
      .json({ mensagem: `Já existe uma conta com o cpf informado!` });
  }

  const emailNaoEUnico = contas.find((conta) => {
    return conta.usuario.email === email;
  });

  if (emailNaoEUnico) {
    return res
      .status(403)
      .json({ mensagem: `Já existe uma conta com o e-mail informado!` });
  }

  // const validacaoEmailECpfUnicos = contas.find((conta) => {
  //   return conta.usuario.cpf === cpf || conta.usuario.email === email
  // })

  if (!Number(numero)) {
    return res.status(400).json({ mensagem: "Você deve passar um número" });
  }

  if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatórios" });
  }

  contaExistente.usuario.nome = nome;
  contaExistente.usuario.cpf = cpf;
  contaExistente.usuario.data_nascimento = data_nascimento;
  contaExistente.usuario.telefone = telefone;
  contaExistente.usuario.email = email;
  contaExistente.usuario.senha = senha;

  res.status(204).send();
};

const deletarConta = (req, res) => {
  const { numero } = req.params;

  if (!Number(numero)) {
    return res.status(400).json({ mensagem: "Você deve passar um número" });
  }

  const index = contas.findIndex((conta) => conta.numero === Number(numero));

  if (index < 0) {
    return res.status(404).json({ mensagem: "produto não encontrado" });
  }

  contas.splice(index, 1);

  return res.status(204).send();
};

const deposito = (req, res) => {
  const { numero, saldo } = req.body;

  const numeroValido = contas.find((conta) => {
    return conta.numero == Number(numero);
  });

  if (!numeroValido) {
    return res
      .status(404)
      .json({ mensagem: "O número da conta é obrigatório!" });
  }

  const horaFormatada = new Date();

  if (numeroValido) {
    numeroValido.saldo += saldo;

    const data = {
      data: format(horaFormatada, "dd-MM-yyy0y"),
      numero,
      saldo: numeroValido.saldo,
    };

    console.log(data);

    depositos.push(data);
  }
  return res.status(200).send();
};

const sacar = (req, res) => {
  const { numero, saldo, senha } = req.body;

  if (!numero || !saldo || !senha) {
    return res
      .status(400)
      .json({ mensagem: `Todos os campos são obrigatórios` });
  }

  const numeroValido = contas.find((conta) => {
    return conta.numero == Number(numero);
  });

  if (numeroValido.usuario.senha !== senha) {
    return res.status(404).json({ mensagem: "senha incorreta" });
  }

  if (numeroValido.saldo === 0) {
    return res.status(404).json({ mensagem: "saldo insuficiente" });
  }

  if (numeroValido.saldo < saldo) {
    return res
      .status(404)
      .json({ mensagem: "O valor não pode ser menor que zero!" });
  }

  numeroValido.saldo -= saldo;

  const data = {
    data: format(new Date(), "yyyy-MM-dd"),
    numero,
    saldo: numeroValido.saldo,
  };

  saques.push(data);

  return res.status(200).send();
};

const transferir = (req, res) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

  const contaOrigem = contas.find(
    (conta) => conta.numero === Number(numero_conta_origem)
  );
  const contaDestino = contas.find(
    (conta) => conta.numero === Number(numero_conta_destino)
  );

  if (contaOrigem === undefined) {
    res.status(404).json({ mensagem: "conta de origem não existe!" });
  }

  if (contaDestino === undefined) {
    res.status(404).json({ mensagem: "conta de destino não existe!" });
  }

  if (contaOrigem.usuario.senha !== senha) {
    return res.status(404).json({ mensagem: "senha incorreta" });
  }

  if (contaOrigem.saldo === 0) {
    return res.status(404).json({ mensagem: "saldo insuficiente" });
  }

  if (contaOrigem.saldo < valor) {
    return res
      .status(404)
      .json({ mensagem: "O valor não pode ser menor que zero!" });
  }

  contaOrigem.saldo -= valor;
  contaDestino.saldo += valor;

  const data = {
    data: format(new Date(), "yyyy-MM-dd"),
    numero_conta_origem,
    numero_conta_destino,
    valor,
  };

  transferencias.push(data);

  res.status(200).send();
};

const saldo = (req, res) => {
  const { numero_conta, senha } = req.query;

  if (!numero_conta) {
    return res.status(400).json({ mensagem: "É necessario o número da conta" });
  }

  if (!senha) {
    return res.status(400).json({ mensagem: "É necessario inserir a senha" });
  }

  const contaEncontrada = contas.find(
    (conta) => conta.numero === Number(numero_conta)
  );

  if (!contaEncontrada) {
    return res.status(404).json({ mensagem: "Conta não encontrada" });
  }

  if (contaEncontrada.usuario.senha !== senha) {
    return res.status(404).json({ mensagem: "senha incorreta" });
  }

  res.status(200).json({ saldo: contaEncontrada.saldo });
};

module.exports = {
  listarContas,
  criarConta,
  atualizarConta,
  deletarConta,
  deposito,
  sacar,
  transferir,
  saldo,
};
