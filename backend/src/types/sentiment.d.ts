declare module 'sentiment' {
  interface SentimentAnalysisResult {
    score: number;
    comparative: number;
    tokens: string[];
    words: string[];
    positive: string[];
    negative: string[];
  }

  class Sentiment {
    analyze(phrase: string): SentimentAnalysisResult;
  }

  export = Sentiment;
}
