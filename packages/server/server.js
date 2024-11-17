import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import csvRoutes from "./routes/csvRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
await connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// 路由
app.use("/api/users", userRoutes);
app.use("/api/form", formRoutes);
app.use("/api/csv", csvRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
