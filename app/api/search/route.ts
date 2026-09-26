import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { UniversalSearchService } from "@/services/search/search-service";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.userId || "guest_student";

    const body = await req.json();
    const { query, targetNoteId = "ALL", history = [], stream = false } = body;

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Valid query of at least 2 characters is required." },
        { status: 400 }
      );
    }

    if (!stream) {
      const response = await UniversalSearchService.search(query, {
        userId,
        targetNoteId,
        history,
      });

      return NextResponse.json({
        success: true,
        data: response,
      });
    }

    // SSE Streaming Mode
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        // Step 1: Query analysis event
        controller.enqueue(
          encoder.encode(`event: step\ndata: ${JSON.stringify({ step: "analyzing", text: "Analyzing query & detecting intent..." })}\n\n`)
        );

        // Step 2: Perform search
        const result = await UniversalSearchService.search(query, {
          userId,
          targetNoteId,
          history,
        });

        // Step 3: Retrieval completed
        controller.enqueue(
          encoder.encode(
            `event: step\ndata: ${JSON.stringify({
              step: "retrieved",
              text: `Retrieved ${result.citations.length} evidence source(s).`,
              sources: result.sourcesChosen,
            })}\n\n`
          )
        );

        // Step 4: Stream words of answer
        const words = result.answerMarkdown.split(" ");
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join(" ") + " ";
          controller.enqueue(
            encoder.encode(`event: token\ndata: ${JSON.stringify({ token: chunk })}\n\n`)
          );
          await new Promise((r) => setTimeout(r, 20));
        }

        // Final payload
        controller.enqueue(
          encoder.encode(`event: done\ndata: ${JSON.stringify(result)}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal search error.",
      },
      { status: 500 }
    );
  }
}
