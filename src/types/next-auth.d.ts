import 'next-auth';
import { DefaultSession } from 'next-b';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}
