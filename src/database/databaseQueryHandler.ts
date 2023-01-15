import { validate, v4 as uuidv4 } from 'uuid';

enum ErrorMessages {
  CantHandle = "Can't handle request",
  NotFound = 'User not found',
  InvalidID = 'Invalid UserID',
}

export function databaseQueryHandler(database: IDatabase, query: IQuery) {
  const { method, userID, body } = query;
  const { username, age, hobbies } = body || {
    username: '',
    age: 1,
    hobbies: [],
  };
  let response: IUser | IUser[] | { error: ErrorMessages } = {
    error: ErrorMessages.CantHandle,
  };

  if (userID && !validate(userID)) return { error: ErrorMessages.InvalidID };

  switch (method) {
    case 'GET':
      if (!userID) {
        response = Object.values(database);
      } else {
        response = database[userID] || { error: ErrorMessages.NotFound };
      }
      break;
    case 'POST':
      if (userID || !body) {
        response = { error: ErrorMessages.CantHandle };
        break;
      }

      const newUserId = uuidv4();
      const newUser: IUser = { id: newUserId, username, age, hobbies };
      database[newUserId] = newUser;
      response = newUser;
      break;
    case 'PUT':
      if (!userID || !body) {
        response = { error: ErrorMessages.CantHandle };
        break;
      }

      if (!(userID in database)) {
        response = { error: ErrorMessages.NotFound };
        break;
      }

      const updatedUser: IUser = { id: userID, username, age, hobbies };
      database[userID] = updatedUser;
      response = updatedUser;

      break;
    case 'DELETE':
      if (!userID) {
        response = { error: ErrorMessages.CantHandle };
        break;
      }

      if (!(userID in database)) {
        response = { error: ErrorMessages.NotFound };
        break;
      }

      const deletedUser = database[userID];
      delete database[userID];
      response = deletedUser;

      break;
  }

  return response;
}
