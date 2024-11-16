const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const formRoutes = require("./routes/formRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// 路由
app.use("/api/users", userRoutes);
app.use("/api/form", formRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
