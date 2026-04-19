import { knowledgeDocuments } from "../data/knowledgeDocuments.js";
import { KnowledgeDocument } from "../models/KnowledgeDocument.js";
import { generateEmbedding } from "./embeddings.js";

export const seedKnowledgeDocuments = async () => {
  for (const document of knowledgeDocuments) {
    await KnowledgeDocument.updateOne(
      { chunkId: document.chunkId },
      {
        $set: {
          ...document,
          embedding: generateEmbedding(
            `${document.title} ${document.category} ${document.section} ${document.content}`
          )
        }
      },
      { upsert: true }
    );
  }

  const count = await KnowledgeDocument.countDocuments();
  console.log(`AI Review knowledge store ready with ${count} chunks`);
};

