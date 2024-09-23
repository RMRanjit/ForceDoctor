import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    instanceUrl?: string;
    user: {
      /** Oauth access token */
      // token?: accessToken;
    } & DefaultSession["user"];
  }

  interface User {
    token: Token;
    userInfo: UserInfo;
    message?: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback  */
  interface JWT {
    accessToken: string;
    refresh_token: string;
    expiration: string;
    userInfo: UserInfo;
    /** OpenID ID Token */
    idToken?: string;
  }
}

interface Token {
  accessToken: string;
  expiration: string;
  refreshToken: string;
}

interface UserInfo {
  userName: string;
  email: string;
  nameSurname: string;
}
