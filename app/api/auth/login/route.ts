import { NextRequest, NextResponse } from "next/server";
import { loginWithIdentifierAction } from "@/features/auth/high-assurance-actions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await loginWithIdentifierAction({
      identifier: body.identifier || "",
      password: body.password || "",
      rememberMe: Boolean(body.rememberMe),
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, message: "ID or password is incorrect." },
      { status: 401 }
    );
  }
}
