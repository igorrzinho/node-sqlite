//import { openDb } from "./configDB.js";
import {
  createTable,
  insertPessoa,
  selectPessoas,
  selectPessoa,
  updatePessoa,
  deletePessoa,
} from "./controller/pessoa.js";
import express from "express";
const app = express();
app.use(express.json());

//openDb();
createTable();

app.get("/", (req, res) => {
  res.send({ "Hello World": "I'm here" });
});

app.get("/pessoas", async (req, res) => {
  let pessoas = await selectPessoas();
  res.json(pessoas);
});

app.get("/pessoa/:id", async (req, res) => {
  let id = req.params.id;
  let pessoa = await selectPessoa(id);
  res.json(pessoa);
});

app.delete("/pessoa/:id", async (req, res) => {
  let id = req.params.id;
  let pessoa = await deletePessoa(id);
  res.json(pessoa);
});

app.post("/pessoa", (req, res) => {
  insertPessoa(req.body);
  res.json({
    message: "usuario adicionado",
  });
});

app.put("/pessoa", (req, res) => {
  if (req.body && !req.body.id) {
    res.json({
      statuscode: "400",
      msg: "voce precisa de um id",
    });
  }
  updatePessoa(req.body);
  res.json({
    message: "usuario editado",
  });
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000/");
});
