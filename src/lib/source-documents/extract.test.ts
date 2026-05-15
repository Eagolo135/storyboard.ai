import { describe, expect, it } from "vitest";

import {
  getUploadSourceTypeFromFileName,
  normalizeExtractedSourceText,
} from "@/lib/source-documents/extract";

describe("source upload detection", () => {
  it("detects supported upload types from file names", () => {
    expect(getUploadSourceTypeFromFileName("chapter-01.pdf")).toBe("pdf");
    expect(getUploadSourceTypeFromFileName("outline.DOCX")).toBe("docx");
  });

  it("rejects unsupported upload types", () => {
    expect(getUploadSourceTypeFromFileName("notes.txt")).toBeNull();
  });

  it("normalizes wrapped PDF lines into paragraphs and removes page markers", () => {
    const normalized = normalizeExtractedSourceText(
      [
        "The Path of an",
        "Undead Book 1:",
        "",
        "1. A New Beginning",
        "A sea of black is all there was…it was all I",
        "was.",
        "I forgot how long I'd been floating in",
        "this place.",
        "",
        "-- 127 of 128 --",
      ].join("\n"),
      "pdf",
    );

    expect(normalized).toContain("A sea of black is all there was…it was all I was.");
    expect(normalized).toContain("I forgot how long I'd been floating in this place.");
    expect(normalized).not.toContain("127 of 128");
  });

  it("keeps DOCX paragraph breaks while trimming noise", () => {
    const normalized = normalizeExtractedSourceText(
      ["Chapter 1", "", "Opening paragraph.", "", "Second paragraph."].join("\n"),
      "docx",
    );

    expect(normalized).toBe("Chapter 1\n\nOpening paragraph.\n\nSecond paragraph.");
  });

  it("separates system-style PDF status lines from adjacent prose", () => {
    const normalized = normalizeExtractedSourceText(
      [
        "A sea of black is all there was.",
        ">Status: Deceased",
        ">Action Required: Reevaluation",
        "A faint glow pierced the black sea.",
        "[Akashic Record]",
        "Name: Unknown",
        "Race: Demonic Beast",
        "The corridor started to shake.",
      ].join("\n"),
      "pdf",
    );

    expect(normalized).toContain(
      "A sea of black is all there was.\n\n>Status: Deceased\n\n>Action Required: Reevaluation\n\nA faint glow pierced the black sea.",
    );
    expect(normalized).toContain(
      "[Akashic Record]\n\nName: Unknown\n\nRace: Demonic Beast\n\nThe corridor started to shake.",
    );
  });

  it("drops leading PDF title-page fragments before the first chapter heading", () => {
    const normalized = normalizeExtractedSourceText(
      [
        "The Path of an",
        "Undead Book 1:",
        "A Hollow",
        "Awakening The Kingdom Of Forwin - Iral's Coil (Labyrinth)",
        "1. A New Beginning",
        "A sea of black is all there was.",
      ].join("\n"),
      "pdf",
    );

    expect(normalized).toBe(
      "1. A New Beginning\n\nA sea of black is all there was.",
    );
  });
});