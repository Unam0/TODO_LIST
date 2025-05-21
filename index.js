import express from 'express';
import pkg from 'pg';
const { Client } = pkg;

const app = express();
const PORT = 3000;

app.use(express.json());

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'TODO_LIST',
    password: '1234',
    port: 5432,
})

client
    .connect()
    .then(async() => {
        console.log('Conectado ao Postgres');

        await client.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                tarefa VARCHAR(200) NOT NULL,
                data DATE NOT NULL,
                status BOOLEAN DEFAULT FALSE
                );
            `)

            console.log('As tabelas foram criadas');
        })
        .catch((error) => {
            console.error("Erro ao conectar com banco:", error);
        });



// -------------------ROTAS--------------------

app.get("/tasks", async (req, res) => {
    const result = await client.query("SELECT * FROM tasks");
    res.json(result.rows);
});

app.get("/tasks/:id", async (req, res) => {
  const TaskId = req.params.id;

  const result = await client.query("SELECT * FROM tasks WHERE id = $1", [
    TaskId,
  ]);
  res.json(result.rows[0]);
});

app.post("/tasks", async (req, res) => {
  const { tarefa, data, status } = req.body;

  try {
    await client.query(
      "INSERT INTO tasks (tarefa, data, status) VALUES ($1, $2, $3)",
      [tarefa, data, status]
    );

    res.status(201).json({ message: "Tarefa criada com sucesso" });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    res.status(500).json({ message: "Erro ao criar tarefa" });
  }
});

app.put("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  const { tarefa, data, status } = req.body;

  try {
    await client.query(
      "UPDATE tasks SET tarefa = $1, data = $2, status = $3 WHERE id = $4",
      [tarefa, data, status, id]
    );

    res.json({
      message: "Tarefa atualizado com sucesso",
    });
  } catch (error) {
    console.error("Ocorreu um erro ao atualizar a tarefa", error);
    res.status(500).json({ message: "Erro ao atualizar a tarefa" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await client.query("DELETE FROM tasks WHERE id = $1", [id]);
    res.json({ message: "Tarefa Deletada" });
  } catch (error) {
    console.error("Ocorreu um erro ao deletar a tarefa", error);
    res.status(500).json({ message: "Erro ao deletar a tarefa" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
