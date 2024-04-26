import { winstonLogger } from '@chandrashekar2001/ecommerce-shared';
import { config } from '@notifications/config';
import { Application } from 'express';
import 'express-async-errors';
import { Logger } from 'winston';
import http from 'http';
import { healthRoutes } from '@notifications/routes';
import { checkConnection } from '@notifications/elasticsearch';
import { createConnection } from '@notifications/queues/connection';
import { Channel } from 'amqplib';
import { consumeAuthEmailMessages, consumeOrderEmailMessages } from '@notifications/queues/email.consumer';
const SERVER_PORT = 4002;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, "notificationServer", 'debug')

export function start(app: Application): void {
    startServer(app);
    app.unsubscribe('', healthRoutes)
    startQueues();
    startElasticSearch();
}

async function startQueues(): Promise<void> {
    //email channel will be used for sending email notifications
    const emailChannel = await createConnection() as Channel
    await consumeAuthEmailMessages(emailChannel)
    await consumeOrderEmailMessages(emailChannel)
}

function startElasticSearch(): void {
    checkConnection()
}

function startServer(app: Application): void {
    try {
        const httpServer: http.Server = new http.Server(app)
        log.info(`Worker with process id of ${process.pid} on notification server has started`)
        httpServer.listen(SERVER_PORT, () => {
            log.info(`Notification service running on PORT : ${SERVER_PORT}`)
        }) 
    } catch (error) {
        log.log('error', 'Notification Service startServer() method', error);
    }
}