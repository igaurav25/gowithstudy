import { NextRequest, NextResponse } from "next/server";
import { adminLoginStep2TotpAction } from "@/features/admin/auth-actions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await adminLoginStep2TotpAction({
      pendingToken: body.pendingToken || "",
      totpCode: body.totpCode,
      backupCode: body.backupCode,
      emailOtp: body.emailOtp,
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
      { success: false, message: "Invalid verification code." },
      { status: 401 }
    );
  }
}
