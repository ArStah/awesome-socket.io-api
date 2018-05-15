// @flow

import ExecutionError from '../server/ExecutionError';

export type TExecutionError = ExecutionError;

export type TRequest = {
  query: string,
  variables?: {},
  $_REQUEST_ID_$: string,
};

export type TErrorCode = string;
export type TErrorDetails = string | Object | mixed[];

export type TResponseData = {};
export type TResponseError = {
  code: TErrorCode,
  details?: TErrorDetails,
};

export type TSuccessResponse = {|
  success: true,
  time: number,
  data: TResponseData,
|};

export type TErrorResponse = {|
  success: false,
  time: number,
  error: TResponseError,
|};

export type TResponse = TSuccessResponse | TErrorResponse;

export type TCommonErrorHandler =
  (code?: TErrorCode, details?: TErrorDetails, fullError?: TResponseError) => any;
export type TSpecErrorHandler = (details?: TErrorDetails, fullError?: TResponseError) => any;

export type TSuccessHandler = (data?: TResponseData) => any;


export type TRequestOptionsWithNoQuery = {
  variables?: {},
  success?: TSuccessHandler,
  error?: TCommonErrorHandler | {
    [code: string]: TSpecErrorHandler,
    default?: TCommonErrorHandler,
  },
  authToken?: string
};

export type TRequestOptions = {
  ...TRequestOptionsWithNoQuery,
  query: string,
}
