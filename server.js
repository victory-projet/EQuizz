import "dotenv/config";
import express, { json, urlencoded } from "express";
import { config } from "dotenv";
config();
import cors from "cors";
import connectDB from "./db/db.js";
const port = process.env.PORT;
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));
app.use("/", authRoutes);

connectDB();

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
