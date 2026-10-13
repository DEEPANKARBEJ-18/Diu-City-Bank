require("dotenv").config();
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", bank: "Diu City Bank" });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/accounts", require("./routes/accounts"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/dashboard", require("./routes/dashboard"));

app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`Diu City Bank API running on http://localhost:${port}`);
});
