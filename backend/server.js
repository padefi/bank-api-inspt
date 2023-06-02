import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// Route
app.use('/api/users', userRoutes);
app.get('/', (req, res) => res.send('API corriendo'));

// Middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`El servidor se encuentra corriendo en el puerto: ${port}`));