const winston = require('winston');
const { combine, timestamp, printf, colorize, json } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    process.env.NODE_ENV === 'production' ? json() : combine(
      colorize(),
      printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

module.exports = logger;