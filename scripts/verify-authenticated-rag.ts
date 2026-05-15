import { readFileSync } from "node:fs";
import path from "node:path";

function stripQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvFile(filePath: string) {
  const content = readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripQuotes(line.slice(separatorIndex + 1).trim());

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function parseArg(name: string) {
  const prefix = `--${name}=`;
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env.local"));

  const { createClient } = await import("@supabase/supabase-js");
  const { getSupabaseAdminConfig } = await import("../src/lib/platform/env");
  const { createPastedSourceDocumentForOwner } = await import(
    "../src/lib/source-documents/service"
  );
  const { createStoryboardResponse } = await import(
    "../src/lib/orchestration/create-storyboard-response"
  );

  const config = getSupabaseAdminConfig();
  const client = createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const requestedOwnerId = parseArg("owner-id");
  const requestedStoryId = parseArg("story-id");

  let ownerId = requestedOwnerId ?? "";
  let storyId = requestedStoryId ?? "";
  let storyTitle = "";

  if (!ownerId || !storyId) {
    const { data, error } = await client
      .from("stories")
      .select("id, owner_clerk_id, title")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("No authenticated stories exist yet.");
    }

    ownerId = data.owner_clerk_id;
    storyId = data.id;
    storyTitle = data.title;
  } else {
    const { data, error } = await client
      .from("stories")
      .select("title")
      .eq("id", storyId)
      .eq("owner_clerk_id", ownerId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    storyTitle = data?.title ?? storyId;
  }

  const marker = new Date().toISOString().replace(/[:.]/gu, "-");
  const sourceTitle = `RAG verification source ${marker}`;
  const rawText = [
    "Captain Nera hides the tideglass compass inside the Red Quay chart locker before dawn.",
    "Harbormaster Vale falsified the outgoing soundings, and the debt ledger proving it is wrapped in oilcloth beneath the locker shelf.",
    "If Meridian House inspectors arrive before sunrise, Nera must decide whether to expose Vale immediately or protect the vanished harbor city's route back into the charts.",
  ].join(" ");
  const request =
    "Plan the next scene where Captain Nera opens the Red Quay chart locker and decides whether to expose Harbormaster Vale's false soundings to Meridian House inspectors.";

  const sourceResult = await createPastedSourceDocumentForOwner(ownerId, {
    storyId,
    title: sourceTitle,
    rawText,
  });

  if (!sourceResult.ok) {
    throw new Error(sourceResult.error);
  }

  const storyboardResponse = await createStoryboardResponse(request, storyId, ownerId);
  const matchedSource = storyboardResponse.retrievedNotes.find((note) =>
    note.title.includes(sourceTitle),
  );

  console.log(JSON.stringify({
    storyId,
    ownerId,
    storyTitle,
    sourceTitle,
    createdSourceDocumentId: sourceResult.data.id,
    sourceProcessingStatus: sourceResult.data.processingStatus,
    retrieval: storyboardResponse.retrieval,
    generation: storyboardResponse.generation,
    evaluationMeta: storyboardResponse.evaluationMeta,
    retrievedTitles: storyboardResponse.retrievedNotes.map((note) => note.title),
    matchedNewSource: Boolean(matchedSource),
  }, null, 2));

  if (!matchedSource) {
    throw new Error("The newly created authenticated source was not retrieved in the storyboard response.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Authenticated RAG verification failed.");
  process.exitCode = 1;
});