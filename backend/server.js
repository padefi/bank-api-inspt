import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import operationRoutes from "./routes/operationRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Route
app.use('/api/users', userRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/accounts', accountRoutes);
app.get('/', (req, res) => res.send('API corriendo'));

// Middlewares error
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`El servidor se encuentra corriendo en el puerto: ${port}`));