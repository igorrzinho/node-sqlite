
# api node com sqlite

esse projeto foi feito para treinar o node js e integrar com algum banco de dados, no caso foi ultilizado o sqlite e foi baseado na seguine [playlist](https://www.youtube.com/playlist?list=PLygIEirBzJi4lTC-5nzfhEyxuKq2y1uiR)

## Instalação

Instale node-sqlite com git

```bash
  git clone https://github.com/igorrzinho/node-sqlite.git
  cd node-sqlite
```
Instale as dependencias e rode ultilizando os seguintes comandos
```bash
  npm i
  npm run dev
```
Se tuso der certo a aplicação vai rodar na porta 3000 http://localhost:3000/

caso de algo provavelmente seja a base de dados veja em [tutorial](#tutorial)
    
## Documentação da API

#### Retorna todos as pessoas

```http
  GET /pessoas
```

| Tipo       | Descrição                           |
| :--------- | :---------------------------------- |
| `string` | vai retornar todas as pessoas cadastradas|

#### Retorna a pessoa de acordo com o id passado

```http
  GET /pessoa/${id}
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `id`      | `string` | **Obrigatório**. O ID da pessoa que você quer |

#### Adiciona um usuario

```http
  POST /pessoas
  {
    "nome":"string", 
    "idade":int
  }
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `nome`      | `string` | **Obrigatorio** o nome da pessoa|
| `idade`      | `int` | **Obrigatorio** a idade da pessoa|

#### Edita um usuario de acordo com o id

```http
  PUT /pessoas
  {
    "id":int,
    "nome":"string", 
    "idade":int
  }
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `idade`      | `int` | **Obrigatorio** o **id** da pessoa|
| `nome`      | `string` | o nome **editado** da pessoa |
| `idade`      | `int` | a idade **editada** da pessoa|


#### Deleta uma pessoa com id que foi passado

```http
  DELETE /pessoa/${id}
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `id`      | `string` | **Obrigatório**. O ID da pessoa que você quer **deletar** |



# tutorial
## sqlite

instalar o sqlite, precisa instalar os dois

```bash
npm install sqlite3 --save
npm install sqlite --save
```

criar um arquivo `configDB` e colocar o seguinte dentro

```jsx
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

// you would have to import / invoke this in another file
export async function openDb () {
  return open({
    filename: './database.db',
    driver: sqlite3.Database
  })
}
```

no `package.json` colocamos um `"type":"module"` no final de tudo

```jsx
{
  "name": "sqlite",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "node src/app.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.1",
    "nodemon": "^2.0.19",
    "sqlite": "^4.1.1",
    "sqlite3": "^5.0.8"
  },
    "type":"module"
}
```

agora no nosso app.js vamos colocar o seguinte:

```jsx
import { openDb } from "./configDB.js";
import express from "express";
const app = express();
app.use(express.json());

openDb();

app.get("/", (req, res) => {
  res.send({ "Hello World": "I'm here" });
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000/");
});
```

e rodar uma vez para que seja criado a db

agora criamos um pasta `controller` e dentro dela um arquivo chamado pessoa.js dentro dele colocamos:

```jsx
import { openDb } from "../configDB.js";

export async function createTable() {
  openDb().then((db) => {
    db.exec(
      "CREATE TABLE IF NOT EXISTS Pessoa ( id INTEGER PRIMARY KEY, nome TEXT, idade INTEGER )"
    );
  });
```

como ja foi criado  a base de dados podemos retirar o `openDb()` e importar os `createTable()` do pessoas.js

```jsx
//import { openDb } from "./configDB.js";
import { createTable } from "./controller/pessoa.js";
import express from "express";
const app = express();
app.use(express.json());

//openDb();
createTable();

app.get("/", (req, res) => {
  res.send({ "Hello World": "I'm here" });
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000/");
});
```

agora vamos criar duas funçoes uma de metodo post e outra de metodo put 

no arquivo `pessoa.js` vamos colocar o seguinte:

```jsx
// essa função recebe o objeto pessoa e vai criar no sql
export async function insertPessoa(pessoa) {
  openDb().then((db) => {
    db.run("INSERT INTO Pessoa (nome, idade) VALUES (?,?)", [
      pessoa.nome,
      pessoa.idade,
    ]);
  });
}

//essa recebe o id e vai alterar a pessoa na base de dados
export async function updatePessoa(pessoa) {
  openDb().then((db) => {
    db.run("UPDATE Pessoa SET nome=?, idade=? WHERE id=?", [
      pessoa.nome,
      pessoa.idade,
      pessoa.id,
    ]);
  });
}
```

e no arquivo `app.js` vamos colocar o seguinte

```jsx
//import { openDb } from "./configDB.js";
import {
  createTable,
  insertPessoa,
  updatePessoa,
} from "./controller/pessoa.js";
import express from "express";
const app = express();
app.use(express.json());

//openDb();
createTable();

app.get("/", (req, res) => {
  res.send({ "Hello World": "I'm here" });
});

app.post("/pessoa", (req, res) => {
  insertPessoa(req.body);//chama a função insertPessoa e passa objeto pessoa para adicionar
  res.json({
    message: "usuario adicionado",
  });
});

app.put("/pessoa", (req, res) => {
  if (req.body && !req.body.id) {//verifica se o id foi informado
    res.json({
      statuscode: "400",
      msg: "voce precisa de um id",
    });
  }
  updatePessoa(req.body);// chama a função updatePessoa e passa a pessoa para fazer a alteração 
  res.json({
    message: "usuario editado",
  });
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000/");
});
```

vamos criar agora um para pegar todas as pessoas no `pessoa.js` criaremos um assim

```jsx
export async function selectPessoas() {
  return openDb().then((db) => {
    return db.all("SELECT * FROM Pessoa").then((res) => res);
  });
}
```

 e no `app.js` vamos importa-la e usa-la

```jsx
app.get("/pessoas", async function (req, res) {
  let pessoas = await selectPessoas();
  res.json(pessoas);
});
```

vamos criar uma para selecionar pelo id

no arquivo `pessoa.js` criaremos uma assim

```jsx
export async function selectPessoa(id) {
  return openDb().then((db) => {
    return db.all("SELECT * FROM Pessoa WHERE id=?", [id]).then((res) => res);
  });
}
```

e no `app.js` vamos importa-la e usa-la

```jsx
app.get("/pessoa/:id", async function (req, res) {
  let id = req.params.id;
  let pessoa = await selectPessoa(id);
  res.json(pessoa);
});
```

 e para deletar vamos criar no `pessoa.js` 

```jsx
export async function deletePessoa(id) {
  return openDb().then((db) => {
    return db.get("DELETE FROM Pessoa WHERE id=?", [id]).then((res) => res);
  });
}
```

e no `app.js` vamos importar e usar 

```jsx
app.delete("/pessoa/:id", async (req, res) => {
  let id = req.params.id;
  let pessoa = await deletePessoa(id);
  res.json(pessoa);
});
```
