import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      sub: string;
      username: string;
    };
    cookies?: {
      refreshToken?: string;
      accessToken?: string;
    };
  }
}
