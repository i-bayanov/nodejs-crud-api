import { IncomingMessage, ServerResponse } from 'http';
import { Worker } from 'cluster';
import { Socket } from 'net';

import { validateAndParseBody } from './misc';

export async function serverRequestHandler(
  databasePort: number,
  request: IncomingMessage,
  response: ServerResponse
) {
  try {
    const { method, url } = request;
    const urlRE = /^\/api\/users(?:\/(?<userID>[^?#\/]+))?$/;
    const urlMatchResult = url?.match(urlRE);

    if (!urlMatchResult) {
      response.statusCode = 404;
      response.end('<h1>Error 404 - Not found</h1>');

      return;
    }

    const { userID } = urlMatchResult.groups!;

    const requestBody = await getBodyFromRequest(request);

    let body: Omit<IUser, 'id'> | { error: string } | null = null;

    if (requestBody) {
      body = validateAndParseBody(requestBody);

      if ('error' in body) {
        response.statusCode = 400;
        response.end('<h1>Error 400 - Invalid request body</h1>');

        return;
      }
    }

    const databaseSocket = new Socket();
    const databaseQuery: IQuery = {
      method: method as IQuery['method'],
      userID,
      body,
    };
    databaseSocket.connect(databasePort, 'localhost');
    databaseSocket.write(JSON.stringify(databaseQuery));
    databaseSocket.on('data', (data) => {
      databaseResponseHandler(response, data.toString());
    });

    // database.on('message', databaseResponseHandler.bind(null, response));

    // database.send(databaseQuery);
  } catch {
    response.statusCode = 500;
    response.end('<h1>Error 500 - Internal server error</h1>');
  }
}

async function getBodyFromRequest(request: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let requestBody = '';

    request
      .on('data', (chunk: string) => {
        if (chunk) requestBody += chunk;
      })
      .on('end', () => {
        resolve(requestBody);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

function databaseResponseHandler(response: ServerResponse, msg: any) {
  response.statusCode = 200;
  response.write(msg);
  response.end();
}
