import CredentialsProvider from 'next-auth/providers/credentials';

import { SECRET, apiEndpoints } from '@/data';
import { BackAPI } from '@/lib';
import NextAuth, { User } from 'next-auth';

import { ConvertApiError } from '@/utils/ConvertApiError';

type Credentials = {
  identifier: string;
  password: string;
  remember: boolean;
};

const login = async (
  identifier: string,
  password: string,
  remember: boolean,
): Promise<
  (User & { remember: boolean; firstName: string; lastName: string }) | null
> => {
  try {
    const { data } = await BackAPI.post(apiEndpoints.login, {
      data: {
        identifier,
        password,
      },
    });
    return {
      id: data.id,
      name: data.username,
      email: data.email,
      image: data.jwt,
      firstName: data.first_name,
      lastName: data.last_name,
      remember,
    };
  } catch (e) {
    const error = ConvertApiError({ error: e });
    throw new Error(error.message);
  }
};
export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'identifier', type: 'text' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials) {
        const { identifier, password, remember } = credentials as Credentials;
        return login(identifier, password, remember);
      },
    }),
  ],
  secret: SECRET,
  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      let modifiedToken = token;
      if (user) {
        modifiedToken = { ...token, user };
      }
      return modifiedToken;
    },
    async session({ session, token }) {
      const modifiedSession = session;
      modifiedSession.user = token.user;
      return modifiedSession;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
});
