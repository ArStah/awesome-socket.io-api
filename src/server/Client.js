// @flow

import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import type {
  TResponseData,
  TSuccessResponse,
  TErrorResponse,
  TExecutionError,
} from '../types';

export default class Client extends EventEmitter {
  _socket: Object;
  _ID: number;
  _user: ?{} = null;

  constructor(clientID: number, socket: Object) {
    super();
    this._ID = clientID;
    this._socket = socket;
  }

  errorResponse(requestID: string, error: TExecutionError, time: number) {
    this._socket.emit(requestID, ({
      time,
      error: {
        code: error.code,
        details: error.details,
      },
      success: false,
    }: TErrorResponse));
  }

  successResponse(requestID: string, result: TResponseData, time: number) {
    const sendObject: TSuccessResponse = {
      success: true,
      data: result,
      time,
    };

    this._socket.emit(requestID, sendObject);
  }

  send(event: string, data?: mixed) {
    this._socket.send({
      event,
      data,
    });
  }
}
