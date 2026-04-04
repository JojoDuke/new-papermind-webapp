import { Mastra } from "@mastra/core";
import { flashcardAuthorAgent } from "./agents/flashcard-author";
import { flashcardWorkflow } from "./workflows/flashcard-workflow";

export const mastra = new Mastra({
  agents: { flashcardAuthorAgent },
  workflows: { flashcardWorkflow },
});

export { flashcardWorkflow };
export type { FlashcardDeck } from "./agents/flashcard-author";
