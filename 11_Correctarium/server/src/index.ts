import express from "express";
import dotenv from "dotenv";
import { router } from "./routes/routes";

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(router);

const server = app.listen(PORT, () => {
  console.log(`server running : http://localhost:${PORT}`);
});

export { app, server };
