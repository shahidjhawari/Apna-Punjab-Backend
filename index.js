require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./models/db");

const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");

const app = express();

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
