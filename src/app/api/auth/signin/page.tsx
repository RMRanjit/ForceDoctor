"use client";
import { useState, useEffect } from "react";
import { getProviders, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  const [providers, setProviders] = useState<any>({});

  useEffect(() => {
    const fetchProviders = async () => {
      const providers = await getProviders();
      setProviders(providers);
    };

    fetchProviders();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Dr.Force Sign In</h1>
      <div className="grid grid-rows-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Object.values(providers).map((provider: any) => (
          <Button
            key={provider.name}
            variant="outline"
            onClick={() => signIn(provider.id)}
          >
            Sign in with {provider.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
