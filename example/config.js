import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const isEnvFound = dotenv.config();

if(isEnvFound.error) {
  throw new Error("Couldn't found .env file");
}

export default {
  rabbitHost: process.env.RABBITMQ_HOST,
  rabbitPort: process.env.RABBITMQ_PORT,
  rabbitUser: process.env.RABBITMQ_DEFAULT_USER,
  rabbitPass: process.env.RABBITMQ_DEFAULT_PASS
}