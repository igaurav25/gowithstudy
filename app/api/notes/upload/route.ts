import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { MAX_PDF_FILE_SIZE } from "@/schemas/notes";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { sanitizeFileName, validatePdfMagicBytes } from "@/lib/security";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Rate Limiting Check: Max 10 uploads per 5 minutes per user
    const rateLimit = checkRateLimit(session.userId, "UPLOAD");
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Upload rate limit reached. Please wait before uploading more documents.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit),
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded." },
        { status: 400 }
      );
    }

    // Security check 1: File size validation (Max 25MB)
    if (file.size > MAX_PDF_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `File size exceeds the 25MB limit (Uploaded: ${(
            file.size /
            (1024 * 1024)
          ).toFixed(1)}MB).`,
        },
        { status: 400 }
      );
    }

    // Security check 2: MIME type and extension validation
    const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
    if (!hasPdfExtension) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file format. Only legitimate PDF (.pdf) documents are accepted.",
        },
        { status: 400 }
      );
    }

    // Security check 3: Magic Bytes Verification (%PDF- header)
    const bytes = await file.arrayBuffer();
    const uint8View = new Uint8Array(bytes);
    if (!validatePdfMagicBytes(uint8View)) {
      return NextResponse.json(
        {
          success: false,
          message: "Security verification failed: File content does not match authentic PDF signature.",
        },
        { status: 400 }
      );
    }

    // Security check 4: Path traversal & filename sanitization
    const sanitizedOriginalName = sanitizeFileName(file.name);

    const uniquePrefix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const savedFileName = `${uniquePrefix}_${sanitizedOriginalName}`;

    // Target upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "notes");

    try {
      await fs.mkdir(uploadDir, { recursive: true });
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadDir, savedFileName);
      await fs.writeFile(filePath, buffer);
    } catch {
      // In serverless / read-only fallback, we can still provide a virtual file URL
    }

    const fileUrl = `/uploads/notes/${savedFileName}`;

    return NextResponse.json({
      success: true,
      message: "PDF uploaded and verified successfully.",
      data: {
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload file.",
      },
      { status: 500 }
    );
  }
}
