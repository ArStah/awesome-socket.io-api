// @flow

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import SocketIOClient from 'socket.io-client';
import MultiTabEvents from 'multitab-events';
import MultiTabSingleton from 'multitab-singleton';


import type { Socket } from 'socket.io-client';

import { generateRequestID } from './utils';
import getLogger from '../logger';

import type {
  TRequestOptions,
  TRequestOptionsWithNoQuery,
  TRequest,
  TResponse,
} from '../types';
import type { TApiClientOptions } from '../types/client';

const log = getLogger('client');

export default class ApiClient extends EventEmitter {
  _connected: boolean = false;
  _bus: EventEmitter;
  _socket: Socket;

  get connected() {
    return this._connected;
  }

  constructor({
    autoConnect = true,
    socketIOConfig = [],
    useMultiTabEvents = true,
  }: TApiClientOptions) {
    super();

    this._bus = (useMultiTabEvents && MultiTabEvents.getBus('api_client')) || this;

    this._socketIOConfig = socketIOConfig;

    if (useMultiTabEvents) {
      MultiTabSingleton().onMaster(() => this.connect());
    } else if (autoConnect) {
      this.connect();
    }
  }

  connect() {
    this.destroy();
    this._socket = new SocketIOClient(...this._socketIOConfig);

    this._socket.on('connect', () => {
      this._connected = true;
      log.debug('connected');
      this._bus.emit('api.connect');
    });

    this._socket.on('disconnect', () => {
      this._connected = false;
      this._bus.emit('api.disconnect');
      log.debug('disconnected');
    });

    this._socket.on('message', (data) => {
      log.debug('Got event %O', data);
      this._bus.emit(data.event, data.data);
    });

    this._bus.on('api.request', (data: TRequest) => {
      this._socket.send(data);
      this._socket.on(data.$_REQUEST_ID_$, (result) => {
        this._bus.emit(`api.response.${data.$_REQUEST_ID_$}`, result);
        this._socket.removeAllListeners(data.$_REQUEST_ID_$);
      });
    });
  }

  request(queryOrOptions: string | TRequestOptions, options: TRequestOptionsWithNoQuery) {
    const $_REQUEST_ID_$ = generateRequestID();

    let opts: TRequestOptions;

    if (typeof queryOrOptions === 'string') {
      opts = {
        ...options,
        query: queryOrOptions,
      };
    } else {
      opts = queryOrOptions;
    }

    const sendData: TRequest = {
      $_REQUEST_ID_$,
      query: opts.query,
    };

    if (typeof opts.variables !== 'undefined') {
      sendData.variables = opts.variables;
    }

    const allowLog: boolean = process.env.NODE_ENV !== 'production';

    const { success, error } = opts;

    return new Promise((resolve, reject) => {
      this._bus.once(`api.response.${$_REQUEST_ID_$}`, async (result: TResponse/* , raw */) => {
        if (result.success) {
          if (allowLog) {
            log.debug('Request: %O\nResponse: %O', sendData, JSON.parse(JSON.stringify(result)));
          }
          if (typeof success === 'function') {
            return resolve(await success(result.data));
          }
          return resolve(result.data);
        }

        if (allowLog) {
          log.warn('Request: %O\nResponse: %O', sendData, JSON.parse(JSON.stringify(result)));
        }

        if (typeof error === 'function') {
          return resolve(await error(result.error.code, result.error.details, result.error));
        } else if (typeof error === 'object') {
          if (typeof error[result.error.code] === 'function') {
            return resolve(await error[result.error.code](result.error.details, result.error));
          }
          if (typeof error.default === 'function') {
            return resolve(await error
              .default(
                result.error.code,
                result.error.details,
                result.error,
              ));
          }
        }
        this._bus.emit('unhandledError', result.error, true);
        return reject(result.error);
      });
      this._bus.emit('api.request', sendData);
    });
  }

  $on(...args: mixed[]) {
    return this._bus.on(...args);
  }

  $once(...args: mixed[]) {
    return this._bus.once(...args);
  }

  $off(...args: mixed[]) {
    return this._bus.removeListener(...args);
  }

  destroy() {
    if (this._socket) {
      this._socket.disconnect();
      this._socket.removeAllListeners();
    }
  }
}
