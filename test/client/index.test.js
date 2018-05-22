import { expect } from 'chai';
import { spy } from 'sinon';
import ApiClient from '../../src/client';
import $server, { port } from './fakeServer';

const $client = new ApiClient({
  useMultiTabEvents: false,
  autoConnect: false,
  socketIOConfig: [`http://localhost:${port}`, {
    transport: ['websockets'],
  }],
});

describe('api.client', () => {
  it('Should not be connected', () => {
    expect($client.connected).to.be.false;
  });

  it('Should connect', (done) => {
    $client.connect();
    $client.$on('api.connect', done);
  });

  it('Should be connected', () => {
    expect($client.connected).to.be.true;
  });

  describe('Request', () => {
    it('Should call success handler when success', async () => {
      const successSpy = spy();

      await $client.request('{ success }', {
        success: successSpy,
      });

      expect(successSpy).to.have.been.calledWith({ success: 'success' });
    });

    it('Should return response data when no success handler specified', async () => {
      const result = await $client.request('{ success }');

      expect(result).to.be.deep.equal({ success: 'success' });
    });

    it('Should call error handler when error', async () => {
      const errorSpy = spy();

      await $client.request('{ error }', {
        error: errorSpy,
      });

      expect(errorSpy).to.have.been.calledOnce;
    });

    it('Should call specified error handler', async () => {
      const errorSpy = spy();

      await $client.request('{ error }', {
        error: {
          __ERROR_CODE__: errorSpy,
        },
      });

      expect(errorSpy).to.have.been.calledOnce;
    });

    it('Should call default error handler if no matching handlers for error', async () => {
      const errorSpy = spy();

      await $client.request('{ error }', {
        error: {
          default: errorSpy,
        },
      });

      expect(errorSpy).to.have.been.calledOnce;
    });

    it('Should emit `unhandledError` event when no error handler specified', async () => {
      const unhandledErrorSpy = spy();

      $client.$once('unhandledError', unhandledErrorSpy);

      try {
        await $client.request('{ error }');
      } catch (error) {
        expect(unhandledErrorSpy).to.have.been.calledOnce;
      }
    });

    it('Should return sum of two numbers', async () => {
      // language=GraphQL
      const result = await $client.request({
        query: 'query sumQuery($a: Int, $b: Int){ sum(a: $a, b: $b) }',
        variables: {
          a: 5,
          b: 8,
        },
      });
      expect(result).to.deep.equal({ sum: 13 });
    });

    it('Should handle event', (done) => {
      $client.$once('kek', (data) => {
        expect(data).to.equal('cheburek');
        done();
      });

      $server.emit('event', {
        event: 'kek',
        data: 'cheburek',
      });
    });

    it('Should add and delete event handler', async () => {
      const handler = spy();
      $client.$on('someEvent', handler);
      // eslint-disable-next-line no-underscore-dangle
      $client._bus.emit('someEvent');
      expect(handler).to.have.been.calledOnce;
      $client.$off('someEvent', handler);
      // eslint-disable-next-line no-underscore-dangle
      $client._bus.emit('someEvent');
      expect(handler).to.have.been.calledOnce;
    });
  });

  after(() => {
    $client.destroy();
    $server.close();
  });
});
