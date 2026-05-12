import rawGlassArchiveKnowledgeBase from "@/lib/data/story-knowledge-base.json";
import rawHollowChoirKnowledgeBase from "@/lib/data/hollow-choir-knowledge-base.json";
import rawNinthEmberKnowledgeBase from "@/lib/data/ninth-ember-knowledge-base.json";
import {
  type StoryKnowledgeBase,
  type StoryMetadata,
  type StoryNote,
  storyKnowledgeBaseSchema,
} from "@/lib/schemas/story";

export const DEFAULT_STORY_ID = "glass-archive";

type StoryPromptSuggestions = Record<string, string[]>;

export type StoryKnowledgeBaseSummary = StoryMetadata & {
  noteCount: number;
};

export interface StoryKnowledgeBaseRepository {
  getKnowledgeBase(storyId?: string): StoryKnowledgeBase;
  getNotes(storyId?: string): StoryNote[];
}

class LocalStoryKnowledgeBaseRepository implements StoryKnowledgeBaseRepository {
  private knowledgeBases?: Map<string, StoryKnowledgeBase>;

  private getKnowledgeBaseMap() {
    if (!this.knowledgeBases) {
      const parsedKnowledgeBases = [
        rawGlassArchiveKnowledgeBase,
        rawHollowChoirKnowledgeBase,
        rawNinthEmberKnowledgeBase,
      ].map((knowledgeBase) => storyKnowledgeBaseSchema.parse(knowledgeBase));

      this.knowledgeBases = new Map(
        parsedKnowledgeBases.map((knowledgeBase) => [knowledgeBase.story.id, knowledgeBase]),
      );
    }

    return this.knowledgeBases;
  }

  getKnowledgeBase(storyId = DEFAULT_STORY_ID): StoryKnowledgeBase {
    const knowledgeBase = this.getKnowledgeBaseMap().get(storyId);

    if (!knowledgeBase) {
      throw new RangeError(`Unknown story knowledge base: ${storyId}`);
    }

    return knowledgeBase;
  }

  getNotes(storyId = DEFAULT_STORY_ID): StoryNote[] {
    return this.getKnowledgeBase(storyId).notes;
  }

  listKnowledgeBaseSummaries(): StoryKnowledgeBaseSummary[] {
    return Array.from(this.getKnowledgeBaseMap().values()).map((knowledgeBase) => ({
      ...knowledgeBase.story,
      noteCount: knowledgeBase.notes.length,
    }));
  }

  hasKnowledgeBase(storyId: string) {
    return this.getKnowledgeBaseMap().has(storyId);
  }
}

export const localStoryKnowledgeBaseRepository =
  new LocalStoryKnowledgeBaseRepository();

const storyPromptSuggestions: StoryPromptSuggestions = {
  [DEFAULT_STORY_ID]: [
    "Draft a chapter 8 confrontation where Mara corners Ilyan inside the Floodgate Engine Hall after decoding the falsified founder ledger.",
    "Plan a scene that continues directly after chapter 7 and tests whether Mara can trust Ilyan long enough to prevent a floodgate collapse.",
    "Generate a storyboard for a rain-soaked chapter 8 scene that balances lore pressure, sibling tension, and the established close-third style.",
  ],
  "hollow-choir": [
    "Draft a chapter 10 confrontation where Sera reaches the west choir gate before Brother Anik and has to decide whether to ring it shut.",
    "Plan a scene inside Bellfound Cathedral that tests whether Sera can trust Anik long enough to expose the dean's false absolution record.",
    "Generate a storyboard for a quiet, pressure-heavy cathedral scene built on resonance debt, breath, bronze, and restrained close-third dread.",
  ],
  "ninth-ember": [
    "Draft a chapter 6 signal-tower confrontation where Jun weighs releasing the route ledger before the engineered ember storm cuts the line.",
    "Plan a scene that continues directly after the false-route decision and tests whether Jun can trust Len Damar long enough to reroute the refugee train.",
    "Generate a storyboard for a heat-struck frontier scene that balances logistics pressure, dry intimacy, and the established close-third style.",
  ],
};

export function getStoryKnowledgeBase(storyId = DEFAULT_STORY_ID): StoryKnowledgeBase {
  return localStoryKnowledgeBaseRepository.getKnowledgeBase(storyId);
}

export function getAllStoryNotes(storyId = DEFAULT_STORY_ID): StoryNote[] {
  return localStoryKnowledgeBaseRepository.getNotes(storyId);
}

export function getNotesGroupedByCategory(storyId = DEFAULT_STORY_ID) {
  return getAllStoryNotes(storyId).reduce<Record<StoryNote["category"], StoryNote[]>>(
    (groups, note) => {
      groups[note.category].push(note);
      return groups;
    },
    {
      character: [],
      lore: [],
      plot: [],
      setting: [],
      style: [],
      "previous-chapter": [],
    },
  );
}

export function listStoryKnowledgeBaseSummaries() {
  return localStoryKnowledgeBaseRepository.listKnowledgeBaseSummaries();
}

export function hasStoryKnowledgeBase(storyId: string) {
  return localStoryKnowledgeBaseRepository.hasKnowledgeBase(storyId);
}

export function getStoryPromptSuggestions(storyId = DEFAULT_STORY_ID) {
  return storyPromptSuggestions[storyId] ?? storyPromptSuggestions[DEFAULT_STORY_ID];
}