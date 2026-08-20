import { defineEntity } from '../dsl/entity/entity-service';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

export const Users = defineEntity<User>({
  endpoint: '/users',
  idKey: '_id',
});
