import http from 'http';
import cluster from 'cluster';
import * as dotenv from 'dotenv';

import { serverRequestHandler } from './serverRequestHandler';
import { runDatabase } from './database';

dotenv.config();
const PORT = Number(process.env.PORT) || 4000;
// console.log(process.env.NODE_ENV_BALANCER);

if (PORT <= 1) throw new Error('Invalid port');

const databasePort = PORT - 1;
runDatabase(databasePort);

if (cluster.isPrimary) {
  const server = http.createServer(
    serverRequestHandler.bind(null, databasePort)
  );

  server.listen(PORT, () => console.log(`Server is listening on PORT ${PORT}`));
  // for (let i = 1; i < 5; i++) {
  //   const fork = cluster.fork({ PORT: PORT + i });
  //   fork.on('online', () => fork.send({ databasePort }));
  // }
} else {
  // process.on('message', (msg) => {
  //   console.log(process.env.PORT, msg);
  // });
}
