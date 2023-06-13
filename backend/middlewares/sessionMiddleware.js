import asyncHandler from "express-async-handler";
import UserSession from "../models/userSessionModel.js";

const INACTIVITY_TIMEOUT = 10 * 60 * 100;

const initialUserExpiration = asyncHandler(async (userId, sessionID) => {
    const currentTime = Date.now();
    const expirationTime = new Date(currentTime + INACTIVITY_TIMEOUT);

    const userSession = await UserSession.create({
        userId,
        sessionID,
        expirationTime
    });

    if (!userSession) {        
        res.status(400);
        throw new Error('Error al crear la sesion.');
    }
});

const extendUserExpiration = asyncHandler(async (userId, sessionID) => {
    const currentTime = Date.now();
    const expirationTime = new Date(currentTime + INACTIVITY_TIMEOUT);

    await UserSession.updateOne(
        { userId, sessionID },
        { $set: { expirationTime } }
    );
});

const endUserExpiration = asyncHandler(async (userId, sessionID) => {
    await UserSession.deleteOne({ userId, sessionID });
});

export {
    initialUserExpiration,
    extendUserExpiration,
    endUserExpiration
}