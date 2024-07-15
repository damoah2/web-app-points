const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const config = require("./config/config");

const app = express();
const pool = new Pool(config.db);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM point ORDER BY name");
    res.render("index", { points: result.rows });
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", async (req, res) => {
  const { name, x, y } = req.body;
  try {
    await pool.query("INSERT INTO point (name, x, y) VALUES ($1, $2, $3)", [
      name,
      x,
      y,
    ]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM point WHERE id = $1", [id]);
    res.render("edit", { point: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.post("/edit/:id", async (req, res) => {
  const id = req.params.id;
  const { name, x, y } = req.body;
  try {
    await pool.query(
      "UPDATE point SET name = $1, x = $2, y = $3 WHERE id = $4",
      [name, x, y, id]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM point WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

const PORT = config.app.port || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
