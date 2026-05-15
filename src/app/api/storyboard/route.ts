import { ZodError } from "zod";

import { getViewer } from "@/lib/auth/viewer";
import { createStoryboardResponse } from "@/lib/orchestration/create-storyboard-response";
import { storyboardRequestSchema } from "@/lib/schemas/story";

function isUuid(value: string | undefined) {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      ),
  );
}

export async function POST(request: Request) {
  try {
    const payload = storyboardRequestSchema.parse(await request.json());

    if (isUuid(payload.storyId)) {
      const viewer = await getViewer();

      if (viewer.status !== "signed-in") {
        return Response.json(
          {
            error: "Sign in to generate a storyboard for this story workspace.",
          },
          { status: 401 },
        );
      }

      const response = await createStoryboardResponse(
        payload.request,
        payload.storyId,
        viewer.userId,
      );

      return Response.json(response);
    }

    const response = await createStoryboardResponse(payload.request, payload.storyId);

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