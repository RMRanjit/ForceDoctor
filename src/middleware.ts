export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import jsforce from "jsforce";
import { getSalesforceConnection } from "./lib/Salesforce";

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest, res: NextResponse) {
  //check if the jwt token exists
  const token = await getToken({ req });
  const currentTime = new Date().getTime();

  // console.log("Middleware token", token, currentTime);
  // console.log(
  //   "Middleware:",
  //   currentTime,
  //   new Date(currentTime).toLocaleTimeString()
  // );

  if (token?.accessToken && token.instanceUrl && token.exp) {
    // console.log(
    //   "Access Token and instance url exists, Authorized!",
    //   token,
    //   token.accessToken,
    //   token.instanceUrl,
    //   token.exp,
    //   currentTime
    // );
    const tokenExpiry = new Date(token.exp as number);
    // console.log(
    //   "Token expires by",
    //   tokenExpiry.toLocaleTimeString(),
    //   "and current time is",
    //   new Date(currentTime).toLocaleTimeString()
    // );

    // console.log(
    //   "Comparing token.exp > currentTime",
    //   (token.exp as number) > currentTime
    // );
    const currentTimeForComparison = new Date(currentTime);

    // console.log(
    //   "Comparing tokenExpiry > currentTime",
    //   tokenExpiry > currentTimeForComparison
    // );

    // if token has expired, redirect to sigin in page..
    if ((token.exp as number) > currentTime) {
      return NextResponse.next();
    } else {
      console.log("Redirecting to sign in page");
      // return NextResponse.redirect(
      //   new URL(`${process.env.NEXTAUTH_URL}/api/auth/signout`)
      // );
    }
  } else {
    return NextResponse.redirect(
      new URL(`${process.env.NEXTAUTH_URL}/api/auth/signin`)
    );
  }

  //   return NextResponse.redirect(new URL("/home", req.url));
}
export const config = {
  matcher: ["/home", "/usage", "/limits", "/api/salesforce"],
};
