import express from 'express';
import { mongo, data } from './server-utils';

const app = express();

mongo(app);
data(app);
// serverUtils.market(app);

app.listen(80, () => {
    console.log('Data Bee');
})
