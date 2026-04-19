const VECTOR_DIMENSIONS = 128;

const hashToken = (token: string) => {
  let hash = 2166136261;

  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

export const generateEmbedding = (text: string) => {
  const vector = new Array<number>(VECTOR_DIMENSIONS).fill(0);
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter((token) => token.length > 2);

  for (const token of tokens) {
    const hash = hashToken(token);
    const index = hash % VECTOR_DIMENSIONS;
    const direction = hash % 2 === 0 ? 1 : -1;
    vector[index] += direction;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!magnitude) return vector;

  return vector.map((value) => value / magnitude);
};

export const cosineSimilarity = (left: number[], right: number[]) => {
  const length = Math.min(left.length, right.length);
  if (!length) return 0;

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] * left[index];
    rightMagnitude += right[index] * right[index];
  }

  if (!leftMagnitude || !rightMagnitude) return 0;

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
};

