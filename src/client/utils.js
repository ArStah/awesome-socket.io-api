// @flow
/* eslint-disable import/prefer-default-export */

export function generateRequestID(): string {
  return +new Date() +
    Math
      .random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15);
}
