import winston from 'winston';
import config from 'config';
import morgan, { StreamOptions } from 'morgan';

const consoleLTransport = new winston.transports.Console({
  level: config.get('logLevel'),
  handleExceptions: true,
});

const logger = winston.createLogger({
  exitOnError: true,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [consoleLTransport],
});

const stream: StreamOptions = {
  write: () => {
    // ignore to avoid logs directly to stdout;
  },
};

export const apiLogger = morgan(
  (tokens, req, res) => {
    const remoteAddr = tokens['remote-addr'](req, res);
    const user = tokens['remote-user'](req, res);
    const method = tokens['method'](req, res);
    const url = tokens['url'](req, res);
    const httpVersion = tokens['http-version'](req, res);
    const status = tokens['status'](req, res);
    const length = tokens['res'](req, res, 'content-length');
    const responseTime = tokens['response-time'](req, res);

    const info = {
      remoteAddr,
      user,
      method,
      url,
      httpVersion,
      status,
      length,
      responseTime,
    };

    const message = `${method} ${url} ${status}`;
    // choose log level
    let logLevel = 'info';
    let stringStatus = `${status}`;

    switch (true) {
      case /^[123].*/.test(stringStatus):
        logLevel = 'info';
        break;
      case /^4.*/.test(stringStatus):
        logLevel = 'warn';
        break;
      case /^5.*/.test(stringStatus):
        logLevel = 'error';
        break;
      default:
        logger.warn(`Unrecognized status code ${status}`);
        break;
    }

    logger.log(logLevel, message, info);

    return status;
  },
  { stream }
);

export default logger;
