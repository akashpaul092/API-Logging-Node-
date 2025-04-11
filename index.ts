import errorEventEmitter from './src/customEvent/createEvent';

const emitError = errorEventEmitter.emitError.bind(errorEventEmitter);
export { emitError };

export { default as loggingMiddleware } from './src/logging/loggingHandler';
