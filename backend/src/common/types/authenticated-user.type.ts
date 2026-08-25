import { UserRole } from 'src/generated/prisma/enums';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: UserRole;
}
