import EventEmitter from 'events';

class ErrorEventEmitter extends EventEmitter {
    emitError(error: Error) {
        this.emit('error', {
            message: error.message,
            stack: error.stack,
        });
    }

    onError(listener: (errorDetails: { message: string; stack: string }) => void) {
        this.on('error', listener);
    }
}

const errorEventEmitter = new ErrorEventEmitter();
export default errorEventEmitter;
