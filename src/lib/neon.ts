import { createClient } from '@neondatabase/neon-js';

export type Database = {
  users: {
    id: number;
    email: string;
    password_hash?: string | null;
    created_at?: string | null;
  };
  posts: {
    id: number;
    title: string;
    category: string;
    read_time: string;
    summary: string;
    created_at?: string | null;
  };
};

export const neon = createClient<Database>({
  auth: {
    url: import.meta.env.VITE_NEON_AUTH_URL,
  },
});
