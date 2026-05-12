import Link from "next/link";

import type { StoryKnowledgeBaseSummary } from "@/lib/data/repository";
import { DEFAULT_STORY_ID } from "@/lib/data/repository";

import styles from "./dashboard.module.css";

type DemoStoryLibraryProps = {
  stories: StoryKnowledgeBaseSummary[];
  activeStoryId: string;
};

function getStoryHref(storyId: string) {
  return storyId === DEFAULT_STORY_ID ? "/" : `/demo/${storyId}`;
}

export function DemoStoryLibrary({ stories, activeStoryId }: DemoStoryLibraryProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeader}>
        <h2>Curated story library</h2>
        <p>Choose a demo workspace with its own lore, continuity pressure, and style rules.</p>
      </div>
      <div className={styles.demoGrid}>
        {stories.map((story) => {
          const isActive = story.id === activeStoryId;

          return (
            <article
              className={`${styles.demoCard} ${isActive ? styles.demoCardActive : ""}`}
              key={story.id}
            >
              <div className={styles.demoCardHeader}>
                <div>
                  <p className={styles.eyebrow}>Demo story</p>
                  <h3>{story.title}</h3>
                </div>
                <span className={styles.demoMeta}>{story.noteCount} notes</span>
              </div>
              <p>{story.premise}</p>
              <div className={styles.genreRow}>
                {story.genre.map((genre) => (
                  <span key={genre}>{genre}</span>
                ))}
              </div>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={styles.secondaryLink}
                href={getStoryHref(story.id)}
              >
                {isActive ? "Currently open" : "Open workspace"}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}