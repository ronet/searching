import mongoose from "mongoose";
import * as schemas from '../schemas';
import { Application } from 'express';

export const mongo = (app: Application) => {

    const config = {
        host: 'localhost',
        port: 27017,
        user: 'root',
        database: 'dataBee',
    }
    
    const setting = {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true
    }

    mongoose.connect(`mongodb://${config.host}:${config.port}/${config.database}`, setting);

    Object.entries(schemas).forEach(([key, value]) => {
        mongoose.model(key, new mongoose.Schema(value));
    });
}