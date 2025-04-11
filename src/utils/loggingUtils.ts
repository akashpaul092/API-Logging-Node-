import { StatusCodes } from 'http-status-codes';
import logger from '../logging/logger';
import { Request, Response } from 'express';
import configurations from '../../config';

export class LoggingUtility {
    logRequest(logData: Record<string, any>,serviceName: string,bucketName:string,awsAccessKey:string,awsSecretKey:string,awsRegion:string): void {
        const loggerInstance = logger(serviceName,bucketName,awsAccessKey,awsSecretKey,awsRegion);
        if (logData.response.status === StatusCodes.OK || logData.response.status === StatusCodes.CREATED) {
            logData.log_level = configurations.INFO_LEBEL;
            loggerInstance.info(logData);
        } else {
            logData.log_level = configurations.ERROR_LEBEL;
            loggerInstance.error(logData);
        }
    }

    prepareLogData(req: Request,res: Response,latency: string,correlationId: string | undefined,err: { message: string; stack: string },serviceName:string,environment:string): Record<string, any> {
        const originalHeaders = { ...req.headers };
        ['access-key', 'secret-key', 'timestamp', 'authorization', 'token'].forEach((key) => delete originalHeaders[key]);

        return {
            timestamp: new Date().toISOString(),
            service_name: serviceName,
            environment: environment,
            correlation_id: correlationId,
            request: {
                method: req.method,
                path: req.originalUrl,
                query_params: req.query,
                path_params: req.params,
                body: Object.keys(req.body).length ? req.body : undefined,
                header: originalHeaders,
            },
            response: {
                status: res.statusCode,
                body: res.locals.body,
            },
            user_id: req.headers.token ? (JSON.parse(req.headers.token as string)?.user_id || '') : '',
            client_ip_address: req.ip || req.connection.remoteAddress,
            server_ip_address: req.socket.localAddress,
            latency,
            error: err,
        };
    }
}
