// @flow

export type TMiddleware = {
  on?: {
    connection?: (client: Object) => void,
    request?: (Object) => void,
  }
};
