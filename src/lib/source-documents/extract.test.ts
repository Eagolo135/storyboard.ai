import { describe, expect, it } from "vitest";

import { getUploadSourceTypeFromFileName } from "@/lib/source-documents/extract";

describe("source upload detection", () => {
  it("detects supported upload types from file names", () => {
    expect(getUploadSourceTypeFromFileName("chapter-01.pdf")).toBe("pdf");
    expect(getUploadSourceTypeFromFileName("outline.DOCX")).toBe("docx");
  });

  it("rejects unsupported upload types", () => {
    expect(getUploadSourceTypeFromFileName("notes.txt")).toBeNull();
  });
});