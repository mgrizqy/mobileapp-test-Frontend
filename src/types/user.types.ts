// Shape of a user returned from GET /api/users/me
// Password and __v are excluded by the backend — never present here.
export type User = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}
