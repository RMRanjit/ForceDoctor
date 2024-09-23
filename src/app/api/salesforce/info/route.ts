import { getTopic } from "@/lib/Salesforce";

import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest, res: NextResponse) {
  let topic = req.nextUrl.searchParams.get("topic");

  try {
    const data = await getTopic(
      topic === null ? undefined : topic,
      undefined,
      req
    );
    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error("Error occured in getTopic route:", err.message);
    return NextResponse.json(
      { error: err.message, errorStack: err.stack },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST };
