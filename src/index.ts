import './LoadEnv'; // Must be the first import
import app from './Server';
import logger from './utils/Logger';
import { intializeDB } from './db';
import { initializeCache } from './db';
import { toSnakeCase } from "shared/utils/stringTransform";

intializeDB();

const redisPORT = Number(process.env.REDIS_PORT || 6379)
initializeCache(redisPORT);

const port = Number(process.env.PORT || 5001);
app.listen(port, () => {
    logger.info('Express server started on port: ' + port + ' redis port is: ' + redisPORT);
});
