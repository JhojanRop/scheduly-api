import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    cookies?: {
      refreshToken?: string;
      accessToken?: string;
    };
  }
}
