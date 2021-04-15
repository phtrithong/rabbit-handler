// ./services/rabbit.js

import amqp from 'amqplib';

export default class RabbitHandler {
  constructor ({
    host, port, user, pass
  }) {
    this.connection = null;
    this.channel = null;
    this.queues = {};
    this.options = {
      host, port, user, pass
    }
  };

  initConnection() {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.connection) {
          return resolve(this.connection);
        }
        else {
          this.connection = await amqp.connect({
            protocol: 'amqp',
            hostname: this.options.host,
            port: this.options.port,
            username: this.options.user,
            password: this.options.pass,
            timeout: 0 // check this property
          });
          return resolve(this.connection);
        }
      }
      catch(err) {
        return reject(err);
      }
    });
  }

  initChannel() {
    return new Promise(async (resolve, reject) => {
      if(!this.connection) {
        this.connection = this.initConnection();
      }

      if (this.channel) {
        return resolve(this.channel);
      }
      else {
        this.channel = await this.connection.createChannel();
        return resolve(this.channel);
      }
    })
  }

  initQueue({queueName, durable = true}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.queues[queueName]) {
          this.queues[queueName] = this.channel.assertQueue(queueName, { durable })
        }

        return resolve(this.queues[queueName]);
      }
      catch (err) {
        return reject(err);
      }
    })
  }

  produce({queueName, data}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!data || !(typeof data === 'object' || typeof data === 'string')) {
          throw Error('Data must be object or string');
        }

        if (typeof data === 'object') {
          data = JSON.stringify(data);
        }

        let result = await this.channel.sendToQueue(queueName, Buffer.from(data), {
          persistent: true
        });

        return resolve(result);
      }
      catch (err) {
        return reject(err);
      }
    })
  }

  async consume({ queueName, callback }) {
    try {
      if (!queueName) {
        throw new Error ('Must implement queueName first');
      }

      this.channel.consume(
        queueName,
        (msg) => {
          callback({
            msg,
            channel: this.channel
          })
        }
      )
    }
    catch (err) {
      console.log(err);
      throw new Error('Failed to consume data')
    }
  }
}