import { type } from 'os';

export type JwtPayload = {
  email: string;
  sub: string;
};
