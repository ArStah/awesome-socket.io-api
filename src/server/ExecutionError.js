// @flow
import type { TErrorDetails, TErrorCode } from '../types';

export default class ExecutionError extends Error {
  code: TErrorCode;
  details: TErrorDetails;

  constructor(code: string, details: (() => TErrorDetails) | TErrorDetails) {
    super('Execution error caused');
    this.code = code;
    this.details = typeof details === 'function' ? details.call() : details;
  }
}
