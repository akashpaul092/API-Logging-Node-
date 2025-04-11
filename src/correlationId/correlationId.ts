import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AxiosStatic } from 'axios';

export class correlationId{
    async getCorrelationId(req: Request){
        return req.headers['x-correlation-id'] as string;
    }

    async setCorrelationId(req: Request,correlationId: string){
        req.headers['x-correlation-id'] = correlationId;
    }

    async setCorrelationIdToAxios(axios:AxiosStatic, correlationId: string){
        axios.defaults.headers.common['x-correlation-id'] = correlationId;
    }

    async generateNewCorrelationId(){
        return uuidv4();
    }
}