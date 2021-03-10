import "reflect-metadata";
import {createConnection, getConnection} from "typeorm";
import { Tedis } from "tedis";
import logger from './utils/Logger';

export async function intializeDB(): Promise<void> {
  await createConnection();
  // const c = await getConnection();
  // console.log('connection', c);
  logger.info('Database successfully initialized');
}

export function initializeCache(port: number | undefined) : unknown {
  const tedis = new Tedis({
    port: port,
    host: "127.0.0.1"
  });
  logger.info('Redis cache successfully initialized');
  return tedis;
}