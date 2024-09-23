"use client";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { redirect } from "next/navigation";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { signIn, signOut, useSession } from "next-auth/react";

import { getIdentity } from "@/lib/Salesforce";
import { cache, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";

type Props = {};

function Profile({}: Props) {
  const [identity, setIdentity] = useState<any>();

  const { data: session, status } = useSession();

  const { resolvedTheme, theme, setTheme } = useTheme();

  // console.log("Profile: Session", session);

  useEffect(() => {
    const getIdentityFromServer = cache(async () => {
      try {
        const response = (await getIdentity()) as string;
        // console.log("Profile: getIdentityFromServer", response);
        if (response && response !== null) setIdentity(JSON.parse(response));
      } catch (err) {
        console.log(err);
        setIdentity(undefined);
        redirect(`/`); // if there is an error and the Identity is not established, redirect to the home page
      }

      // const response = await fetch("/api/salesforce/identity");
      // const resData = await response.json();
      // console.log("Profile: getIdentityFromServer", data?.identity);
      // setIdentity(resData?.identity);
    });

    getIdentityFromServer();
  }, []);

  if (status === "loading") {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </Button>
    );
  }

  if (
    status === "authenticated" &&
    session &&
    identity &&
    Date.now() < Date.parse(session.expires)
  ) {
    console.log("Profile: identity", identity);
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Avatar>
            {/* "/ProfilePic2.jpeg" */}
            <AvatarImage src={identity.photos?.thumbnail} alt="Profile Image" />
            <AvatarFallback delayMs={100} className="text-primary">
              {identity.first_name && identity.last_name
                ? identity?.first_name[0] + identity?.last_name[0]
                : "NP"}
            </AvatarFallback>
          </Avatar>
        </HoverCardTrigger>
        <HoverCardContent className="w-100">
          <div className="flex justify-between space-x-4">
            <div className="space-y-1 w-full">
              <p className="text-sm font-bold">
                {/* Hello, {identity ? " John Doe" : identity?.first_name}{" "}
                {identity?.last_name}
                 */}
                Hello , {identity?.display_name || session.user.email}
              </p>
              <span className="text-xs line-clamp-1">
                {session?.instanceUrl
                  ? `Connected to ${session?.instanceUrl}`
                  : "Instance URL not found"}
              </span>
              <div className="flex items-center space-x-2">
                <Switch
                  id="dark-mode"
                  checked={resolvedTheme === "dark"}
                  onCheckedChange={(checked: boolean) => {
                    //checked ? setTheme("dark") : setTheme("light");
                    setTheme(checked ? "dark" : "light");
                  }}
                />
                <Label htmlFor="dark-mode">Dark Mode</Label>
              </div>
              <div className="flex items-center pt-2">
                <span className="text-xs text-muted-foreground">
                  {/* <Link href="/api/auth/signout"> */}
                  <Button
                    onClick={() =>
                      signOut({ callbackUrl: "/", redirect: true })
                    }
                  >
                    Sign Out
                  </Button>
                  {/* </Link> */}
                  {/* <Link href="/api/auth/signout">Sign Out</Link> */}
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  } else {
    //
    return (
      <div className="flex flex-row pr-4">
        <Button onClick={() => signIn("sfdcProd")}> Sign In</Button>
        <HoverCard>
          <HoverCardTrigger asChild>
            <ChevronDown className="my-2 " />
          </HoverCardTrigger>
          <HoverCardContent className="w-100">
            <div className="flex flex-col justify-between gap-3 ">
              <Button
                onClick={() => signIn("sfdcProd")}
                className="w-32 "
                variant="destructive"
              >
                Production
              </Button>
              <Button onClick={() => signIn("sfdcDev")} className="w-32">
                Sandbox
              </Button>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    );
  }
}

export default Profile;

// <Button onClick={() => signIn("sfdcProd")}>Sign In</Button>
// <Button onClick={() => signIn("sfdcDev")}>Sandbox SignIn</Button>
