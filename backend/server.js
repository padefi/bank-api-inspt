import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import operationRoutes from "./routes/operationRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import { extendUserExpiration } from "./middlewares/sessionMiddleware.js";

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middlewares session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 10,
        secure: process.env.NODE_ENV !== 'development',
    }
}));
app.use(async (req, res, next) => {
    if (req.session.userId) {
        await extendUserExpiration(req.session.userId, req.sessionID);
    }

    next();
});

// Route
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/accounts', accountRoutes);
app.get('/', (req, res) => res.send('API corriendo'));

// Middlewares error
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`El servidor se encuentra corriendo en el puerto: ${port}`));