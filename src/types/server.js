// @flow
import type Client from '../server/Client';
import type Server from '../server';

export type TMiddleware = (client: Client) => any;

export type TServerMiddleware = {
  server: (server: Server) => any,
  client: TMiddleware
};
