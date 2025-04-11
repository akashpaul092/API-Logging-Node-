export class helper{
    generateS3LogPath(logType: string,serviceName: string){
        let timestamp: Date = new Date();
        const year = timestamp.getFullYear();
        const month = String(timestamp.getMonth() + 1).padStart(2, '0'); 
        const date = String(timestamp.getDate()).padStart(2, '0');
        const time = timestamp.toISOString().replace(/[:.]/g, '-');
    
        return `${serviceName}/${year}/${month}/${date}/${logType}/log-${time}.log`;
    }
    
}