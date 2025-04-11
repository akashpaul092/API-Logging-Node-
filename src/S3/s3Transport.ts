import TransportStream from 'winston-transport';
import { uploadFileToS3, getLatestFileFromS3 } from './s3Service'; // Import necessary S3 service functions
import { helper } from '../utils/helper';
import configurations from '../../config';
import { S3Client } from '@aws-sdk/client-s3';

class S3TransportStream extends TransportStream {
    private helperObj: helper = new helper();
    private serviceName: string;
    private bucketName: string;
    private s3Client;

    constructor(options: { level: string},serviceName:string,bucketName:string,awsAccessKey:string,awsSecretKey:string,awsRegion:string) {
        super(options);
        this.serviceName = serviceName;
        this.bucketName = bucketName;
        this.s3Client = new S3Client({
            region: awsRegion,
            credentials: {
                accessKeyId: awsAccessKey,
                secretAccessKey: awsSecretKey
            },
        });
    }

    async log(info: any, callback: () => void) {
        // Call `setImmediate` to handle logging asynchronously
        setImmediate(() => this.emit('logged', info)); // Emit the logged event

        const logMessage = `${info.timestamp || new Date().toISOString()} ${info.level}: ${typeof info.message === 'object' ? JSON.stringify(info.message) : info.message}\n`;
        
        // Determine log type from info.level
        const logType = info.level; // Use the log level as the log type (e.g., 'info', 'error', etc.)
        let filePath = this.helperObj.generateS3LogPath(logType,this.serviceName);
        let logPath = filePath.substring(0, filePath.lastIndexOf('/'));// Generate the S3 log path

        try {
            // Check the current file size on S3
            const currentFile = await getLatestFileFromS3(logPath, this.bucketName, this.s3Client);
            let filename = "";
            if (!currentFile || (currentFile.size && currentFile.size > configurations.FILE_SIZE_LIMIT)) { // If the file size exceeds 100 KB
                filename = this.helperObj.generateS3LogPath(logType,this.serviceName); // Generate a new log path
            }else{
                filename = currentFile.key || this.helperObj.generateS3LogPath(logType,this.serviceName);
            }

            // Upload the log message to S3
            await uploadFileToS3(filename, logMessage, this.bucketName, this.s3Client);
        } catch (err) {
            console.error(`Error uploading log to S3: ${logPath}`, err);
        }

        // Call the callback function to indicate logging is complete
        callback();
    }
}

export { S3TransportStream };
