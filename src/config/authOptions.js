// import type { NextAuthOptions } from "next-auth";
// import SalesforceProvider from "next-auth/providers/Salesforce";
import { signIn } from "next-auth/react";
import { cookies } from "next/headers";

/**
 * Method to check the token expire date by calling the
 * Salesforce End point fot Token Introspection.
 * @param token
 */
export const tokenIntrospection = async (tokenObject) => {
  try {
    var data = JSON.stringify({
      token: tokenObject.accessToken,
      token_type_hint: "access_token",
      client_id: process.env.SALESFORCE_CLIENT_ID,
      client_secret: process.env.SALESFORCE_CLIENT_SECRET,
    });

    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: data,
    };

    const tokenResponse = await fetch(
      `${process.env.SALESFORCE_URL_LOGIN}/services/oauth2/introspect`,
      options
    );

    return await tokenResponse;
  } catch (error) {
    return {
      error: "TokenIntrospectionError",
    };
  }
};

/**
 * Consume token object and returns a new updated `accessToken`.
 * @param tokenObject
 */
export const refreshAccessToken = async (tokenObject) => {
  try {
    var data = JSON.stringify({
      grant_type: "refresh_token",
      client_id: process.env.SALESFORCE_CLIENT_ID,
      client_secret: process.env.SALESFORCE_CLIENT_SECRET,
      refresh_token: tokenObject.refreshToken,
    });

    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: data,
    };

    // TODO: This is giving a undefined response. Investigate if this is an await operation issue
    const tokenResponse = async () =>
      await fetch(
        `${process.env.SALESFORCE_URL_LOGIN}/services/oauth2/token`,
        options
      )
        .then((response) =>
          console.log("refreshAccessToken: Response: ", response)
        )
        .catch((error) => console.error("tokenResponse Error", error));

    const { access_token, refresh_token, instance_url } = await tokenResponse;
    // console.log(
    //   "refreshAccessToken: Response: ",
    //   access_token,
    //   refresh_token,
    //   instance_url
    // );

    // Get expire date from token introspection end point.
    tokenObject.accessToken = access_token ?? tokenObject.accessToken;
    const { exp, error } = await tokenIntrospection(tokenObject);

    return {
      accessToken: access_token ?? tokenObject.accessToken,
      refreshToken: refresh_token ?? tokenObject.refreshToken,
      exp: exp,
      accessTokenExpires: exp,
      instanceUrl: instance_url ?? tokenObject.instanceUrl,
    };
  } catch (error) {
    return {
      error: "RefreshAccessTokenError",
    };
  }
};

// export const authOptions: NextAuthOptions = {
export const authOptions = {
  callbacks: {
    //{ token, user, account, profile, isNewUser }
    async jwt({ token, account, profile }) {
      // console.log("JWT Callback: Account", account);
      // console.log("JWT Callback: Token", token);
      // console.log("JWT Callback: profile", profile);

      // Initial sign in
      if (account) {
        // console.log("JWT Callback: ", JSON.stringify(account));
        // Set access and refresh token
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.instanceUrl = account.instance_url;
        // token.user = account.user;

        // Get the Expire Date
        const { exp } = await tokenIntrospection(token);
        console.log("Token Introspection Token Expiry is ", exp);
        token.exp = exp;
        token.accessTokenExpires = exp;
        const { accessTokenExpires } = await tokenIntrospection(token);
        token.accessTokenExpires = accessTokenExpires;
        token.exp = accessTokenExpires;

        console.log("Use New Token...");
        return Promise.resolve(token);
      }

      if (profile) {
        token.user = profile;
      }

      // @ts-ignored
      if (Date.now() < token.accessTokenExpires * 1000) {
        console.log("Use Previous Token...");
        return Promise.resolve(token);
      }

      console.log("Use Refresh Token...");
      // console.log("Use Refresh Token...", token);
      return Promise.resolve(await refreshAccessToken(token));
    },
    async session({ session, token, user }) {
      // console.log("Session callback: user:", user);
      // console.log("Session callback: token:", token);
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.instanceUrl = token.instanceUrl;
      session.tokenExpires = token.accessTokenExpires;

      // session.user = user;
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.first_name = token.given_name;
      session.user.last_name = token.family_name;

      return session;
    },
  },
  events: {
    async signOut({ token, session }) {
      console.log("Signout called", token, session);
      // Delete auth cookie on signout so it doesn't persist past log out
      // res.setHeader("Set-Cookie", "");

      // Set token/session to {}, that would update the clientside token/session as well
      token = {};
      session = {};
      cookies().delete("next-auth.callback-url");
      cookies().delete("next-auth.csrf-token");
    },
  },
  // session: {
  //   strategy: "jwt",
  // },
  debug: false,
  providers: [
    // SalesforceProvider({
    //   id: "salesforce",
    //   name: "Salesforce Production Instance",
    //   clientId: process.env.SALESFORCE_CLIENT_ID,
    //   clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
    //   idToken: true,
    //   wellKnown: `${process.env.SALESFORCE_URL_LOGIN}/.well-known/openid-configuration`,
    //   authorization: {
    //     params: { display: "page", scope: "openid api refresh_token" },
    //   },
    //   userinfo: {
    //     async request({ provider, tokens, client }) {
    //       // console.log("AuthOptions: userInfo", tokens, provider, client);

    //       //@ts-ignored
    //       return await client.userinfo(tokens, {
    //         //@ts-ignored
    //         params: provider.userinfo?.params,
    //       });
    //     },
    //   },
    //   profile(profile) {
    //     return { id: profile.email, ...profile };
    //   },
    // }),
    // SalesforceProvider({
    //   id: "salesforce",
    //   name: "Salesforce Sandbox Instance",
    //   clientId: process.env.SALESFORCE_CLIENT_ID,
    //   clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
    //   idToken: true,
    //   wellKnown: `${process.env.SALESFORCE_URL_SANDBOX}/.well-known/openid-configuration`,
    //   issuer: process.env.SALESFORCE_URL_SANDBOX,
    //   authorization: {
    //     params: { display: "page", scope: "openid api refresh_token" },
    //   },
    //   userinfo: {
    //     async request({ provider, tokens, client }) {
    //       // console.log("AuthOptions: userInfo", tokens, provider, client);

    //       //@ts-ignored
    //       return await client.userinfo(tokens, {
    //         //@ts-ignored
    //         params: provider.userinfo?.params,
    //       });
    //     },
    //   },
    //   profile(profile) {
    //     return { id: profile.email, ...profile };
    //   },
    // }),
    {
      id: "sfdcDev",
      name: "Dev Instance",
      type: "oauth",
      version: "2.0",
      scope: "openid full api refresh_token",

      clientId: process.env.SALESFORCE_CLIENT_ID,
      clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
      wellKnown: `${process.env.SALESFORCE_URL_SANDBOX}/.well-known/openid-configuration`,
      params: {
        grant_type: "authorization_code",
        display: "page",
        scope: "openid api full refresh_token",
      },
      accessTokenUrl:
        process.env.SALESFORCE_URL_SANDBOX + "/services/oauth2/token",
      requestTokenUrl:
        process.env.SALESFORCE_URL_SANDBOX + "/services/oauth2/token",
      authorizationUrl:
        process.env.SALESFORCE_URL_SANDBOX +
        "/services/oauth2/authorize?display=page",
      profileUrl:
        process.env.SALESFORCE_URL_SANDBOX + "/services/oauth2/userinfo",
      authorization: {
        url:
          process.env.SALESFORCE_URL_SANDBOX +
          "/services/oauth2/authorize?display=page",
        params: { display: "page", scope: "openid api full refresh_token" },
      },
      token: `${process.env.SALESFORCE_URL_SANDBOX}/services/oauth2/token`,
      userinfo: `${process.env.SALESFORCE_URL_SANDBOX}/services/oauth2/userinfo`,
      options: {
        // Dev hint: works only if following library code has changed
        // file: /node_modules/next-auth/core/lib/provider.js; line: 23 ff
        // move method parameter '...userOptions' to 3rd place
        // @ts-ignore
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/sfdcDev`,
      },
      profile: (profile) => {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
        };
      },
      checks: ["none"],
    },
    {
      id: "sfdcProd",
      name: "Prod Instance",
      type: "oauth",
      version: "2.0",
      scope: "openid api refresh_token",
      clientId: process.env.SALESFORCE_CLIENT_ID,
      clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
      wellKnown: `${process.env.SALESFORCE_URL_LOGIN}/.well-known/openid-configuration`,
      params: {
        // grant_type: "authorization_code",
        display: "page",
        scope: "openid api refresh_token",
      },
      accessTokenUrl:
        process.env.SALESFORCE_URL_LOGIN + "/services/oauth2/token",
      requestTokenUrl:
        process.env.SALESFORCE_URL_LOGIN + "/services/oauth2/token",
      authorizationUrl:
        process.env.SALESFORCE_URL_LOGIN +
        "/services/oauth2/authorize?display=page",
      profileUrl:
        process.env.SALESFORCE_URL_LOGIN + "/services/oauth2/userinfo",
      authorization: {
        url:
          process.env.SALESFORCE_URL_LOGIN +
          "/services/oauth2/authorize?display=page",
        params: { display: "page", scope: "openid api full refresh_token" },
      },
      token: `${process.env.SALESFORCE_URL_LOGIN}/services/oauth2/token`,
      userinfo: `${process.env.SALESFORCE_URL_LOGIN}/services/oauth2/userinfo`,
      options: {
        // Dev hint: works only if following library code has changed
        // file: /node_modules/next-auth/core/lib/provider.js; line: 23 ff
        // move method parameter '...userOptions' to 3rd place
        // @ts-ignore
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/sfdcProd`,
      },
      profile: (profile) => {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
        };
      },
      checks: ["none"],
    },
  ],
  // pages: {
  //   signIn: "/auth/signin",
  // },
};
