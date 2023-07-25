import winston from "winston";
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    const date = new Date(timestamp);
    const formattedTimestamp = `${date.toDateString()} ${date.toTimeString().split(' ')[0]}`;
    return `[${formattedTimestamp}] [${level}]: ${message}`;
});

const logger = createLogger({
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        /* new winston.transports.Console(), */
        new transports.File({
            filename: 'server.log'
        })
    ]
});

export default logger;