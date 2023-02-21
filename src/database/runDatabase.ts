import net from 'net';

import { databaseQueryHandler } from './databaseQueryHandler';

export function runDatabase() {
  const databasePort = process.env.PORT;
  const database: IDatabase = {};

  const dbServer = net.createServer((connection) => {
    connection.on('data', (chunk) => {
      const request: IQuery = JSON.parse(chunk.toString());
      const response = databaseQueryHandler(database, request);
      connection.write(JSON.stringify(response));
      connection.pipe(connection);
    });
  });

  dbServer.listen(databasePort, () =>
    console.log('Database is running on PORT', databasePort)
  );
}
