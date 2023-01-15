interface IQuery {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  userID: string | undefined;
  body: Omit<IUser, 'id'> | null;
}
