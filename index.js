require("dotenv").config();
const express = require("express");
const userRoutes = require("./routes/user.route");
const taskRoutes = require("./routes/task.route");

const app = express();

const cors = require("cors");
const morgan = require("morgan");

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/server-status", (req, res) => {
  res.status(200).json({ message: "Server is up and running!" });
});

app.use("/user", userRoutes);
app.use("/task", taskRoutes);

const server = app.listen(PORT, () =>
  console.log(`
🚀 Server ready at: http://localhost:${PORT}`)
);
