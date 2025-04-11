import dotenv from 'dotenv';
const configFile = `./.env.${process.env.NODE_ENV}`;
dotenv.config({path: configFile});

const configurations = {
    ENVIRONMENT: <string>process.env.ENVIRONMENT,
    FILE_SIZE_LIMIT: 100 * 1024, // 100 KB
    API_LOG_BUCKET_NAME: <string>process.env.API_LOG_BUCKET_NAME,
    INFO_LEBEL: 'info',
    ERROR_LEBEL: 'error'
}

export default configurations