import express from "express";
import { Pool } from "pg";
import { tableNotes, tableUsers } from "./db/createSQL";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 8080;

// Database connection configuration variables.
// In production environment, these values should be set via .env file.
const USER = "postgres"; // Database user name
const HOST = "localhost"; // Database host
const DB = "postgres"; // Database name
const PASSWORD = "1234"; // Database connection password
const PORTDB = 5432; // Database connection port

// Note: In production environment, the above configuration variables should be
// moved to a .env file to ensure data security and ease of management.

const allowedOrigins = ["http://localhost:5173"];
const options: cors.CorsOptions = {
  origin: allowedOrigins,
  methods: "GET,POST,PUT,DELETE",
};
app.use(cors(options));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 100000,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.raw({ limit: "50mb", inflate: true }));

const pool = new Pool({
  user: USER,
  host: HOST,
  database: DB,
  password: PASSWORD,
  port: PORTDB,
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    const checkUsersQuery =
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')";
    const { rows: usersExist } = await client.query(checkUsersQuery);

    if (!usersExist[0].exists) {
      await client.query(tableUsers);
      console.log("Table 'users' created.");
    } else {
      console.log("Table 'users' already exists.");
    }

    const checkNotesQuery =
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes')";
    const { rows: notesExist } = await client.query(checkNotesQuery);

    if (!notesExist[0].exists) {
      await client.query(tableNotes);
      console.log("Table 'notes' created.");
    } else {
      console.log("Table 'notes' already exists.");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    client.release();
  }
}

async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();

app.on("error", (err) => {
  console.log("Server error:", err);
});
