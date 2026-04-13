import { KnowledgeDocument } from "../models/KnowledgeDocument.js";

export const retrieveRelevantChunks = async (draftContent: string) => {
  const keywords = draftContent
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);

  const docs = await KnowledgeDocument.find();

  const scored = docs.map((doc) => {
    const text = doc.content.toLowerCase();

    const score = keywords.reduce((acc, word) => {
      return acc + (text.includes(word) ? 1 : 0);
    }, 0);

    return { doc, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.doc);
};