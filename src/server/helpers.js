// @flow

import type {
  TResponseData,
  TSuccessResponse,
  TErrorResponse,
  TExecutionError,
} from '../types';

export function errorResponse(requestID: string, error: TExecutionError, time: number) {
  this._socket.emit(`response.${requestID}`, ({
    time,
    error: {
      code: error.code,
      details: error.details,
    },
    success: false,
  }: TErrorResponse));
}

export function successResponse(requestID: string, result: TResponseData, time: number) {
  const sendObject: TSuccessResponse = {
    success: true,
    data: result,
    time,
  };

  this._socket.emit(`response.${requestID}`, sendObject);
}
