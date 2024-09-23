import { getIdentity } from "@/lib/Salesforce";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
async function handler(req: NextRequest) {
  return (await getIdentity(req)) as Response;
}

export { handler as GET };
