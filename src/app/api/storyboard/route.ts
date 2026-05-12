import { ZodError } from "zod";

import { createStoryboardResponse } from "@/lib/orchestration/create-storyboard-response";
import { storyboardRequestSchema } from "@/lib/schemas/story";

export async function POST(request: Request) {
  try {
    const payload = storyboardRequestSchema.parse(await request.json());
    const response = createStoryboardResponse(payload.request, payload.storyId);

    return Response.json(response);
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: error.issues[0]?.message ?? "Invalid request.",
        },
        { status: 400 },
      );
    }

    if (error instanceof RangeError) {
      return Response.json(
        {
          error: error.message,
        },
        { status: 404 },
      );
    }

    return Response.json(
      {
        error: "Unable to generate storyboard right now.",
      },
      { status: 500 },
    );
  }
}