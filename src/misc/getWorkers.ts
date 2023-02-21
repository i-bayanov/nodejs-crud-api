import cluster from 'cluster';
import { cpus } from 'os';

export interface IWorkerInitialMessage {
  runAs: 'database' | 'worker';
  databasePort: number;
}

export function getWorkers(mainPort: number, databasePort: number) {
  return cpus().map((_cpu, index) => {
    const workerPort = mainPort! + index + 1;
    const worker = cluster.fork({ PORT: workerPort });
    worker.once('online', () => {
      const message: IWorkerInitialMessage = {
        runAs: 'worker',
        databasePort,
      };
      worker.send(message);
    });

    return workerPort;
  });
}
