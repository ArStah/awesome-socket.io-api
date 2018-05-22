// @flow

import { EventEmitter2 as EventEmitter } from 'eventemitter2';

export default class Client extends EventEmitter {
  _socket: Object;
  _ID: number;

  get ID() {
    return this._ID;
  }

  get socket() {
    return this._socket;
  }

  constructor(clientID: number, socket: Object) {
    super();
    this._ID = clientID;
    this._socket = socket;
  }

  send(type: string, data?: mixed) {
    this._socket.emit(type, data);
  }
}
