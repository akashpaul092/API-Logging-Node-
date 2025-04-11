import { createLogger, format } from 'winston';
import { S3TransportStream } from '../S3/s3Transport';
import configurations from '../../config';

export const logger = (serviceName: string,bucketName:string,awsAccessKey:string,awsSecretKey:string,awsRegion:string) => {
    const createS3Transport = (level: string) => new S3TransportStream(
        { level }, 
        serviceName, 
        bucketName, 
        awsAccessKey, 
        awsSecretKey, 
        awsRegion
    );
    return createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.errors({ stack: true }), 
            format.json()
        ),
        transports: [
            createS3Transport(configurations.INFO_LEBEL),
            createS3Transport(configurations.ERROR_LEBEL)
        ],
    })
}

export default logger;
