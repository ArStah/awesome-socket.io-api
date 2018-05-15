/* eslint-disable no-console */
import createDebugger from 'debug';

export default function (type) {
  const name = `socket.io-api:${type}:`;

  const debug = createDebugger(`${name}debug`);

  const log = createDebugger(`${name}log`);
  // log.color = log.useColors && 'white';
  log.log = console.log.bind(console);

  const info = createDebugger(`${name}info`);
  // info.color = info.useColors && 'cyan';
  info.log = console.info.bind(console);

  const warn = createDebugger(`${name}warn`);
  // warn.color = warn.useColors && 'grey';
  warn.log = console.warn.bind(console);

  const error = createDebugger(`${name}error`);
  // error.color = error.useColors && 'red';
  error.log = console.error.bind(console);

  const logger = (...args) => log(...args);

  logger.log = log;
  logger.debug = debug;
  logger.info = info;
  logger.warn = warn;
  logger.error = error;

  return logger;
}
