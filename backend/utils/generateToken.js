import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
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