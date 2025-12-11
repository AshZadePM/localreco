import Sentiment from 'sentiment';

interface SentimentResult {
  score: number;
  comparative: number;
  label: 'positive' | 'neutral' | 'negative';
}

const sentimentAnalyzer = new Sentiment();

/**
 * Analyzes sentiment of text using the sentiment library.
 *
 * Scoring methodology:
 * - Uses the sentiment npm package which analyzes text using a pre-trained vocabulary
 * - Returns a score between -5 and 5
 * - comparative: score / word count (normalized score per word)
 * - Label classification:
 *   - positive: comparative > 0.1
 *   - negative: comparative < -0.1
 *   - neutral: -0.1 <= comparative <= 0.1
 *
 * @param text The text to analyze
 * @returns SentimentResult with score, comparative value, and label
 */
function analyzeSentiment(text: string): SentimentResult {
  try {
    const result = sentimentAnalyzer.analyze(text);

    let label: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (result.comparative > 0.1) {
      label = 'positive';
    } else if (result.comparative < -0.1) {
      label = 'negative';
    }

    return {
      score: result.score,
      comparative: result.comparative,
      label,
    };
  } catch (error) {
    console.warn('Sentiment analysis failed:', error instanceof Error ? error.message : String(error));
    return {
      score: 0,
      comparative: 0,
      label: 'neutral',
    };
  }
}

/**
 * Batch analyze sentiment for multiple texts.
 *
 * @param texts Array of texts to analyze
 * @returns Array of SentimentResults
 */
function analyzeSentimentBatch(texts: string[]): SentimentResult[] {
  return texts.map(text => analyzeSentiment(text));
}

export { analyzeSentiment, analyzeSentimentBatch, SentimentResult };
