import { processRequest } from "@/lib/Salesforce";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest, res: NextResponse) {
  try {
    const apiHeader = {
      url: "/services/data/v51.0/limits",
      method: "GET",
    };

    const data = await processRequest(apiHeader, req);
    return NextResponse.json({ data: data }, { status: 200 });
  } catch (err: any) {
    console.error("Error occured in limit route:", err.message);
    return NextResponse.json(
      { error: err.message, errorStack: err.stack },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST };
