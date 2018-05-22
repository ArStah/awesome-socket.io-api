// @flow
import type Client from '../server/Client';
import type Server from '../server';

export type TServerMiddleware = (server: Server, client: Client) => any;
