import winston from "winston";
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, printf, prettyPrint } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

/* const logger = createLogger({
    transports: [
        /* new transports.Cosole({
            level: 'info',
            format: format.combine(format.timestamp(), format.json())
        }), */
/* new transports.File({
     filename: 'server.log',
     format: format.combine(format.timestamp(), format.json())
 })
]
}); */

const logger = createLogger({
    format: combine(
        /* label({ label: 'right meow!' }), */
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.File({
            filename: 'server.log'
        })
    ]
});
export default logger;