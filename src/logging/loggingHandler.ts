import { Request, Response, NextFunction } from 'express';
import { correlationId } from '../correlationId/correlationId';
import errorEventEmitter from '../customEvent/createEvent';
import { LoggingUtility } from '../utils/loggingUtils';
import { AxiosInstance, AxiosStatic } from 'axios';


const loggingMiddleware = (serviceName: string,environment: string,bucketName: string, awsAccessKey: string,awsSecretKey: string,awsRegion: string,axios?: AxiosStatic) =>{
    
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Correlation ID Handling
        const correlationIdHandler = new correlationId();
        let cId = await correlationIdHandler.getCorrelationId(req);
        if (!cId) {
            cId = await correlationIdHandler.generateNewCorrelationId();
        }
        await correlationIdHandler.setCorrelationId(req, cId);
        if(axios) await correlationIdHandler.setCorrelationIdToAxios(axios,cId);
        
        const start = process.hrtime();
        const originalSend = res.send;

        res.send = function (body) {
            res.locals.body = body;
            return originalSend.call(this, body);
        };

        let err: { message: string; stack: string } = { message: '', stack: '' };

        // Error Handling
        errorEventEmitter.onError((errorDetails) => {
            err.message = errorDetails.message;
            err.stack = errorDetails.stack;
        });

        // Response Finish Event
        res.on('finish', () => {
            const [seconds, nanoseconds] = process.hrtime(start);
            const latency = `${Math.round(seconds * 1000 + nanoseconds / 1e6)}ms`;

            const loggingUtility = new LoggingUtility();
            const logData = loggingUtility.prepareLogData(req, res, latency, cId, err,serviceName, environment);
            loggingUtility.logRequest(logData,serviceName,bucketName,awsAccessKey,awsSecretKey,awsRegion);
        });

        next();
    }
}

export default loggingMiddleware;
