import jwt from "jsonwebtoken";
import logger from './logger.js';

const generateToken = (res, userId) => {
    logger.info(`generateToken por el usuario: ${userId}`);

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '10m',
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 10 // 10 minutos
    });
}

const extendToken = (req, res) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    logger.info(`extendToken por el usuario: ${decoded.userId}`);

    const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, {
        expiresIn: '10m',
    });

    res.cookie('jwt', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 10 // 10 minutos
    });
}

export {
    generateToken,
    extendToken
}