"use server";

import { revalidatePath } from "next/cache";

import { getViewer } from "@/lib/auth/viewer";
import {
  createPastedSourceDocumentForOwner,
  createUploadedSourceDocumentForOwner,
} from "@/lib/source-documents/service";
import { createStoryForOwner } from "@/lib/stories/service";

export type CreateStoryActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type CreatePastedSourceActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type CreateUploadedSourceActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function createStoryAction(
  _previousState: CreateStoryActionState,
  formData: FormData,
): Promise<CreateStoryActionState> {
  const viewer = await getViewer();

  if (viewer.status !== "signed-in") {
    return {
      status: "error",
      message: "You must be signed in before creating a story.",
    };
  }

  const result = await createStoryForOwner(viewer.userId, {
    title: String(formData.get("title") ?? ""),
    summary: String(formData.get("summary") ?? ""),
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.error,
    };
  }

  revalidatePath("/dashboard");

  return {
    status: "success",
    message: `Created story: ${result.data.title}`,
  };
}

export async function createPastedSourceAction(
  _previousState: CreatePastedSourceActionState,
  formData: FormData,
): Promise<CreatePastedSourceActionState> {
  const viewer = await getViewer();

  if (viewer.status !== "signed-in") {
    return {
      status: "error",
      message: "You must be signed in before adding source material.",
    };
  }

  const result = await createPastedSourceDocumentForOwner(viewer.userId, {
    storyId: String(formData.get("storyId") ?? ""),
    title: String(formData.get("sourceTitle") ?? ""),
    rawText: String(formData.get("rawText") ?? ""),
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.error,
    };
  }

  revalidatePath("/dashboard");

  return {
    status: "success",
    message: `Saved source text: ${result.data.fileName ?? "Untitled source"}`,
  };
}

export async function createUploadedSourceAction(
  _previousState: CreateUploadedSourceActionState,
  formData: FormData,
): Promise<CreateUploadedSourceActionState> {
  const viewer = await getViewer();

  if (viewer.status !== "signed-in") {
    return {
      status: "error",
      message: "You must be signed in before uploading source material.",
    };
  }

  const file = formData.get("sourceFile");
  const storyId = String(formData.get("storyId") ?? "");
  const result = await createUploadedSourceDocumentForOwner(
    viewer.userId,
    storyId,
    file instanceof File ? file : new File([], ""),
  );

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/stories/${storyId}`);

  if (!result.ok) {
    return {
      status: "error",
      message: result.error,
    };
  }

  return {
    status: "success",
    message: `Uploaded source file: ${result.data.fileName ?? "Untitled source"}`,
  };
}
