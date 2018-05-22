// @flow
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import http from 'http';
import SocketIO from 'socket.io';
import { graphql as GraphQL, buildSchema, GraphQLError } from 'graphql';

import Client from './Client';
import { successResponse, errorResponse } from './helpers';

import getLogger from '../logger';

import ExecutionError from './ExecutionError';
import type { TRequest } from '../types';
import type {
  TServerMiddleware,
  TMiddleware,
} from '../types/server';

const log = getLogger('server');

export default class ApiServer extends EventEmitter {
  _clients: {
    [key: number]: Client,
  } = {};

  _ids: number = 0;
  _graphql: Object;
  _io: SocketIO;
  _middlewares: TMiddleware[] = [];

  get socketIO() {
    return this._io;
  }

  constructor({
    graphql,
    port,
  }: {
    graphql: {
      schema: any,
      resolvers?: Object,
    },
    port: number,
  }) {
    super();

    const schema = typeof graphql.schema === 'string' ? buildSchema(graphql.schema) : graphql.schema;

    Object.defineProperties(this, {
      _graphql: {
        value: {
          schema,
          resolvers: graphql.resolvers,
        },
      },
    });

    const httpServer = http.createServer();

    this._io = new SocketIO(httpServer);

    httpServer.listen(port, () => {
      log.debug(`server listening on port ${port}`);
      this.emit('listening');
    });

    this._io.on('connection', async (socket) => {
      this.emit('connection', socket);

      const clientID = this._ids;
      this._ids += 1;

      log.debug(`Client ${clientID} connected`);

      const client = new Client(clientID, socket);

      await this._middlewares.reduce(
        (prom, middleware) => prom.then(() => middleware(client)),
        Promise.resolve(),
      );

      socket.on('request', async ({ query, variables, $_REQUEST_ID_$ }: TRequest) => {
        const startTime = +new Date();

        const {
          data, errors,
        }: {
          data: any,
          errors?: $ReadOnlyArray<GraphQLError>
        } = await GraphQL(
          this._graphql.schema, query,
          this._graphql.resolvers, {
            client,
            api: this,
          },
          variables,
        );
        if (typeof errors !== 'undefined') {
          const error = errors[0].originalError;
          if (typeof error !== 'undefined') {
            return errorResponse.call(
              client,
              $_REQUEST_ID_$, ((error: any): ExecutionError),
              +new Date() - startTime,
            );
          }

          return errorResponse.call(
            client,
            $_REQUEST_ID_$,
            new ExecutionError(
              '$__GRAPHQL_ERROR__$',
              errors.map(err => ({
                message: err.message,
                locations: err.locations,
              })),
            ),
            +new Date() - startTime,
          );
        }
        return successResponse.call(client, $_REQUEST_ID_$, data, +new Date() - startTime);
      });

      socket.on('disconnect', () => {
        delete this._clients[clientID];
        log.debug(`Client ${clientID} disconnected`);
      });

      this._clients[clientID] = client;
    });
  }

  broadcast(
    type: string,
    data: Object,
  ) {
    const toSend: Array<Client> = Object.keys(this._clients).map(k => this._clients[+k]);

    log.debug('Broadcast %O', data);

    toSend.forEach((client) => {
      client.send(type, data);
    });
  }

  addMiddleware(middleware: TServerMiddleware) {
    middleware.server(this);
    this._middlewares.push(middleware.client);
  }

  destroy() {
    this._io.close();
    delete this._io;
  }
}
