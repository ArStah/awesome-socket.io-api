// Testing utils
import { expect } from 'chai';

// Graphql schema creator
import { makeExecutableSchema } from 'graphql-tools';

// Api server
import ApiServer from '../../src/server/index';
import { REQUIRE } from '../../src/server/utils';
import { generateRequestID } from '../../src/client/utils';

// Api client creator
import createClient, { port } from './fakeClient';

const falafels = [{
  pitaSize: 15,
  balls: 6,
  spicy: true,
}, {
  pitaSize: 13,
  balls: 4,
  spicy: false,
}];

let $server;
let $client;

describe('api.server', () => {
  it('Should start listening', (done) => {
    $server = new ApiServer({
      port,
      graphql: {
        schema: makeExecutableSchema({
          // language=GraphQL Schema
          typeDefs: `
            type Query {
              falafel(ID: Int): Falafel,
              falafelWithError: Falafel,
            }

            type Falafel {
              pitaSize: Int,
              balls: Int,
              spicy: Boolean,
            }
          `,
          resolvers: {
            Query: {
              falafel(_, { ID }) {
                return falafels[ID];
              },
              falafelWithError() {
                REQUIRE(false, '__BUGAGA__');
              },
            },
          },
        }),
      },
    });
    $server.on('listening', done);
  });

  it('Should create client', (done) => {
    $client = createClient();
    $client.once('connect', done);
  });

  it('Should handle request', (done) => {
    const $_REQUEST_ID_$ = generateRequestID();

    $client.send({
      $_REQUEST_ID_$,
      // Language=GraphQL
      query: `
        {
          falafel(ID: 0) {
            pitaSize
            balls
            spicy
          }
        }
      `,
    });

    $client.once($_REQUEST_ID_$, (data) => {
      expect(data.success).to.be.true;
      expect(data.data).to.deep.equal({
        falafel: falafels[0],
      });
      done();
    });
  });

  it('Should handle errors during request', (done) => {
    const $_REQUEST_ID_$ = generateRequestID();

    $client.send({
      $_REQUEST_ID_$,
      // Language=GraphQL
      query: `
        {
          falafelWithError {
            pitaSize
            balls
            spicy
          }
        }
      `,
    });

    $client.once($_REQUEST_ID_$, (data) => {
      expect(data.success).to.be.false;
      expect(data.error).to.deep.equal({
        code: '__BUGAGA__',
      });
      done();
    });
  });

  it('Should handle graphql errors during request', (done) => {
    const $_REQUEST_ID_$ = generateRequestID();

    $client.send({
      $_REQUEST_ID_$,
      // Language=GraphQL
      query: `
        {
          falafel {
            pitaSize
            balls
            spicy
            error
          }
        }
      `,
    });

    $client.once($_REQUEST_ID_$, (data) => {
      expect(data.success).to.be.false;
      expect(data.error.code).to.equal('$__GRAPHQL_ERROR__$');
      done();
    });
  });

  it('Should handle request with variables', (done) => {
    const $_REQUEST_ID_$ = generateRequestID();

    $client.send({
      $_REQUEST_ID_$,
      // Language=GraphQL
      query: `
        query getFalafel($ID: Int) {
          falafel(ID: $ID) {
            pitaSize
            balls
            spicy
          }
        }
      `,
      variables: {
        ID: 1,
      },
    });

    $client.once($_REQUEST_ID_$, (data) => {
      expect(data.success).to.be.true;
      expect(data.data).to.deep.equal({
        falafel: falafels[1],
      });
      done();
    });
  });

  it('Should send event', (done) => {
    $client.once('message', (data) => {
      expect(data).to.deep.equal({
        event: 'kek',
        data: 'cheburek',
      });
      done();
    });
    $server.send('kek', 'cheburek');
  });

  after(() => {
    $client.destroy();
    // eslint-disable-next-line no-underscore-dangle
    $server.destroy();
  });
});
