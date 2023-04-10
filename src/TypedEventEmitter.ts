import { EventEmitter } from 'events';

export class TypedEventEmitter<TEvents extends Record<string | symbol, unknown[]>> {
  private emitter = new EventEmitter();

  emit<TEventName extends keyof TEvents>(eventName: TEventName, ...eventArg: TEvents[TEventName]) {
    if (typeof eventName === 'number') throw new Error('Event name must be a string or a symbol');
    return this.emitter.emit(eventName, ...eventArg);
  }

  on<TEventName extends keyof TEvents>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void) {
    if (typeof eventName === 'number') throw new Error('Event name must be a string or a symbol');
    this.emitter.on(eventName, handler as never);
    return this;
  }

  off<TEventName extends keyof TEvents>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void) {
    if (typeof eventName === 'number') throw new Error('Event name must be a string or a symbol');
    this.emitter.off(eventName, handler as never);
    return this;
  }
}
