export type UserRole = 'user' | 'authed_user' | 'mod' | 'admin';

export type UserRow = {
  id: number;
  email: string;
  role: UserRole;
  created_at: string;
};

export const roleOptions: UserRole[] = ['user', 'authed_user', 'mod', 'admin'];
