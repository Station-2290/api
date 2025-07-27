import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      username: string;
      role: Role;
      jti?: string;
      customer_id?: number | null;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
