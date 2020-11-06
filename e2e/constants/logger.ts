import { createLogger, format, transports } from 'winston';
import { browser } from 'protractor';

const loglevel = (browser && browser.params && browser.params.winston_loglevel) || 'debug';

// https://github.com/winstonjs/winston
const myFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.mss    ' }),
  format((_info) => {
    _info.level = _info.level.toUpperCase().padStart(7);
    return _info;
  })(),
  format.splat(),
  format.colorize(),
  format.printf((_info) => `[${_info.level}] ${_info.timestamp ? `${_info.timestamp}` : ''}${_info.message}`),
);

/**
 * Log levels are:
 * error
 * warn
 * info
 * http
 * verbose
 * debug
 * silly
 * .
 */
export const logger = createLogger({
  level: loglevel,
  format: myFormat,
  transports: [
    // - Write to file
    // new transports.File({ filename: '../../e2e.log' }),

    // - Write all logs error (and above) to Console/terminal
    new transports.Console(),
  ],
});
