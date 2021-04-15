import RabbitHandler from '../src/index.js';
import config from './config.js';

const rabbitHandler = new RabbitHandler({
  host: config.rabbitHost,
  port: config.rabbitPort,
  user: config.rabbitUser,
  pass: config.rabbitPass
});

async function init () {
  await rabbitHandler.initConnection();
  await rabbitHandler.initChannel();

  await rabbitHandler.initQueue({
    queueName: 'test'
  });
  rabbitHandler.consume({
    queueName: 'test',
    callback: ({msg, channel}) => {
      let data = JSON.parse(msg.content.toString());
      console.log('data :>> ', data);

      channel.ack(msg);
    }
  });

  rabbitHandler.produce({
    queueName: 'test',
    data: {
      msg:'hello'
    }
  })
}

init();