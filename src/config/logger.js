const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info",

  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),

  transports: [
    // Console Log
    new transports.Console(),

    // All Logs
    new transports.File({
      filename: "logs/combined.log",
    }),

    // Error Logs
    new transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
  ],
});

module.exports = logger;