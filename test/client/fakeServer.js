// @flow
import SocketIO from 'socket.io';
import { graphql, buildSchema, GraphQLError } from 'graphql';
import { REQUIRE } from '../../src/server/utils';

import type { TRequest, TResponse } from '../../src/types/index';
import type ExecutionError from '../../src/server/ExecutionError';

export const port = 33456;

// language=GraphQL Schema
const schema = buildSchema(`
  type Query {
    success: String,
    sum(a: Int, b: Int): Int,
    error: String
  }
`);

const resolvers = {
  success() {
    return 'success';
  },
  sum(data) {
    return data.a + data.b;
  },
  error() {
    REQUIRE(false, '__ERROR_CODE__', { someDetails: 'test' });
  },
};

function errorResponse(socket: Object, requestID: string, err: ExecutionError, time: number) {
  const error = {
    code: err.code,
    details: err.details,
  };

  socket.emit(`response.${requestID}`, ({
    time,
    error,
    success: false,
  }: TResponse));
}

function successResponse(socket: Object, requestID: string, result: {}, time: number) {
  const sendObject: TResponse = {
    success: true,
    data: result,
    time,
  };

  socket.emit(`response.${requestID}`, sendObject);
}

const server = new SocketIO(port);

server.on('connection', (socket) => {
  socket.on('request', async (requestData: TRequest) => {
    const timeStart = +new Date();

    try {
      const { query, variables } = requestData;

      const {
        data, errors,
      }: {
        data: any, errors?: $ReadOnlyArray<GraphQLError>
      } = await graphql(schema, query, resolvers, {
        client: null,
        api: this,
      }, variables);

      if (typeof errors !== 'undefined') {
        return errorResponse(
          socket, requestData.$_REQUEST_ID_$, ((errors[0].originalError: any): ExecutionError),
          +new Date() - timeStart,
        );
      }

      return successResponse(socket, requestData.$_REQUEST_ID_$, data, +new Date() - timeStart);
    } catch (err) {
      return errorResponse(socket, requestData.$_REQUEST_ID_$, err, +new Date() - timeStart);
    }
  });
});

export default server;
