import http from 'http';
import cluster from 'cluster';
import * as dotenv from 'dotenv';

import {
  serverRequestHandler,
  balancerRequestHandler,
  getWorkers,
  IWorkerInitialMessage,
} from './misc';
import { runDatabase } from './database';

if (cluster.isPrimary) {
  dotenv.config();
  const mainPort = Number(process.env.PORT) || 4000;
  const databasePort = mainPort - 1;
  const withBalancer = process.env.NODE_ENV_BALANCER === 'with_balancer';

  if (mainPort <= 1) throw new Error('Invalid port');

  let server: http.Server;

  const database = cluster.fork({ PORT: databasePort });
  database.once('online', () => {
    const message: IWorkerInitialMessage = { runAs: 'database', databasePort };
    database.send(message);
  });

  if (withBalancer) {
    const workers = getWorkers(mainPort, databasePort);

    server = http.createServer(balancerRequestHandler.bind(null, workers));
  } else {
    server = http.createServer(serverRequestHandler.bind(null, databasePort));
  }

  server.listen(mainPort, () =>
    console.log(`Server is listening on http://localhost:${mainPort}`)
  );
} else {
  const workerPort = process.env.PORT;

  process.once('message', ({ runAs, databasePort }: IWorkerInitialMessage) => {
    if (runAs === 'database') runDatabase();

    if (runAs === 'worker') {
      const workerServer = http.createServer(
        serverRequestHandler.bind(null, databasePort)
      );

      workerServer.listen(workerPort, () =>
        console.log(`Worker is listening on http://localhost:${workerPort}`)
      );
    }
  });
}
