import cluster from 'cluster';
import net from 'net';

import { databaseQueryHandler } from './databaseQueryHandler';

export function runDatabase(port: number) {
  if (cluster.isPrimary) {
    cluster.fork({ PORT: port });
  } else {
    const OneUser: IUser = {
      id: '2e3e040a-feb0-48de-9aff-ee7b3f537a4e',
      username: 'Vlad',
      age: 590,
      hobbies: ['war', 'vampirism'],
    };
    const database: IDatabase = { [OneUser.id]: OneUser };
    // const database: IDatabase = {};

    const dbServer = net.createServer((connection) => {
      connection.on('data', (chunk) => {
        const request: IQuery = JSON.parse(chunk.toString());
        const response = databaseQueryHandler(database, request);
        connection.write(JSON.stringify(response));
        connection.pipe(connection);
      });
    });

    dbServer.listen(process.env.PORT);
  }
}
