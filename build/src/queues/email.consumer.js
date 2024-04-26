"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeOrderEmailMessages = exports.consumeAuthEmailMessages = void 0;
const config_1 = require("../config");
const ecommerce_shared_1 = require("@chandrashekar2001/ecommerce-shared");
const connection_1 = require("../queues/connection");
const mail_transport_1 = require("../queues/mail.transport");
const log = (0, ecommerce_shared_1.winstonLogger)(`${config_1.config.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug');
function consumeAuthEmailMessages(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!channel) {
                channel = (yield (0, connection_1.createConnection)());
            }
            const exchangeName = 'ecommerce-email-notification';
            const routingKey = 'auth-email';
            const queueName = 'auth-email-queue';
            yield channel.assertExchange(exchangeName, 'direct');
            const ecommerceQueue = yield channel.assertQueue(queueName, { durable: true, autoDelete: false });
            yield channel.bindQueue(ecommerceQueue.queue, exchangeName, routingKey);
            channel.consume(ecommerceQueue.queue, (msg) => __awaiter(this, void 0, void 0, function* () {
                const { receiverEmail, username, verifyLink, resetLink, template } = JSON.parse(msg.content.toString());
                const locals = {
                    appLink: `${config_1.config.CLIENT_URL}`,
                    appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
                    username,
                    verifyLink,
                    resetLink,
                };
                yield (0, mail_transport_1.sendEmail)(template, receiverEmail, locals);
                channel.ack(msg);
            }));
        }
        catch (error) {
            log.log('error', 'NotificationService EmailConsumer consumeAuthEmailMessages() method error:', error);
        }
    });
}
exports.consumeAuthEmailMessages = consumeAuthEmailMessages;
function consumeOrderEmailMessages(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!channel) {
                channel = (yield (0, connection_1.createConnection)());
            }
            const exchangeName = 'ecommerce-order-notification';
            const routingKey = 'order-email';
            const queueName = 'order-email-queue';
            yield channel.assertExchange(exchangeName, 'direct');
            const ecommerceQueue = yield channel.assertQueue(queueName, { durable: true, autoDelete: false });
            yield channel.bindQueue(ecommerceQueue.queue, exchangeName, routingKey);
            channel.consume(ecommerceQueue.queue, (msg) => __awaiter(this, void 0, void 0, function* () {
                const { receiverEmail, username, template, sender, offerLink, amount, buyerUsername, sellerUsername, title, description, deliveryDays, orderId, orderDue, requirements, orderUrl, originalDate, newDate, reason, subject, header, type, message, serviceFee, total } = JSON.parse(msg.content.toString());
                const locals = {
                    appLink: `${config_1.config.CLIENT_URL}`,
                    appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
                    username,
                    sender,
                    offerLink,
                    amount,
                    buyerUsername,
                    sellerUsername,
                    title,
                    description,
                    deliveryDays,
                    orderId,
                    orderDue,
                    requirements,
                    orderUrl,
                    originalDate,
                    newDate,
                    reason,
                    subject,
                    header,
                    type,
                    message,
                    serviceFee,
                    total
                };
                if (template === 'orderPlaced') {
                    yield (0, mail_transport_1.sendEmail)('orderPlaced', receiverEmail, locals);
                    yield (0, mail_transport_1.sendEmail)('orderReceipt', receiverEmail, locals);
                }
                else {
                    yield (0, mail_transport_1.sendEmail)(template, receiverEmail, locals);
                }
                channel.ack(msg);
            }));
        }
        catch (error) {
            log.log('error', 'NotificationService EmailConsumer consumeOrderEmailMessages() method error:', error);
        }
    });
}
exports.consumeOrderEmailMessages = consumeOrderEmailMessages;
//# sourceMappingURL=email.consumer.js.map