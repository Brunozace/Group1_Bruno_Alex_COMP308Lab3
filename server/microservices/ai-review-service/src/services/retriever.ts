import { KnowledgeDocument } from "../models/KnowledgeDocument.js";
import { cosineSimilarity, generateEmbedding } from "./embeddings.js";

export type RetrievedChunk = {
  title: string;
  category: string;
  section: string;
  chunkId: string;
  content: string;
  relevanceScore: number;
};

export const retrieveRelevantChunks = async (draftContent: string) => {
  const queryEmbedding = generateEmbedding(draftContent);

  const docs = await KnowledgeDocument.find();

  const scored = docs.map((doc) => {
    const storedEmbedding =
      doc.embedding.length > 0
        ? doc.embedding
        : generateEmbedding(`${doc.title} ${doc.category} ${doc.section} ${doc.content}`);

    return {
      doc,
      score: Math.max(0, cosineSimilarity(queryEmbedding, storedEmbedding))
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map<RetrievedChunk>((item) => ({
      title: item.doc.title,
      category: item.doc.category,
      section: item.doc.section,
      chunkId: item.doc.chunkId,
      content: item.doc.content,
      relevanceScore: Number(item.score.toFixed(4))
    }));
};
