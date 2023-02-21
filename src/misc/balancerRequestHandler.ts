import {
  IncomingMessage,
  ServerResponse,
  RequestOptions,
  request as serverRequest,
} from 'http';

let i = 0;

export function balancerRequestHandler(
  workers: number[],
  request: IncomingMessage,
  response: ServerResponse
) {
  const requestOptions: RequestOptions = {
    path: request.url,
    port: workers[i],
    method: request.method,
  };
  const requestToWorker = serverRequest(
    'http://localhost',
    requestOptions,
    (responseFromWorker) => {
      responseFromWorker.pipe(response);
    }
  );
  request.pipe(requestToWorker);

  i++;

  if (i === workers.length) i = 0;
}
