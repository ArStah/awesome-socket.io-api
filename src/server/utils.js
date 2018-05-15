// @flow

import ExecutionError from './ExecutionError';

export function REQUIRE(condition: boolean, ...args: Array<any>) {
  if (!condition) {
    throw new ExecutionError(...args);
  }
}

export default false;
