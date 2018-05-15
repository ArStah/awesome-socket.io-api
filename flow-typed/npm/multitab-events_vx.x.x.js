// flow-typed signature: bb9208674a05ddb542b4f8f3f386737e
// flow-typed version: 0.0.1/multitab-events_v0.0.4/flow_v0.71.0
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

declare module 'multitab-events' {
  declare class MultiTabEvents extends EventEmitter {
    static getBus(prefix: string): MultiTabEvents
  }

  declare type TMultiTabEvents = typeof MultiTabEvents

  declare export default TMultiTabEvents;
}
