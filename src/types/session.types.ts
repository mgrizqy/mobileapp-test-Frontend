// Shape of a session returned from GET /api/sessions
// refreshTokenHash and __v are excluded by the backend — never present here.
export type Session = {
  _id: string;
  userId: string;
  deviceName: string;
  createdAt: string;
  updatedAt: string;
};
