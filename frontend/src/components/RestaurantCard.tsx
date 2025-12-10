import { RestaurantResult } from '../types';

interface RestaurantCardProps {
  result: RestaurantResult;
}

export function RestaurantCard({ result }: RestaurantCardProps) {
  const sentimentColor =
    result.sentimentScore >= 70
      ? 'bg-green-100 text-green-800'
      : result.sentimentScore >= 40
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  const sentimentLabel =
    result.sentimentScore >= 70 ? 'Positive' : result.sentimentScore >= 40 ? 'Neutral' : 'Negative';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Restaurant Title */}
      <h3 className="text-lg font-bold mb-2">
        <a
          href={result.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {result.restaurantName}
        </a>
      </h3>

      {/* Sentiment Score Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${sentimentColor}`}
        >
          {sentimentLabel} ({result.sentimentScore}%)
        </span>
      </div>

      {/* Sentiment Metrics (if available) */}
      {result.sentimentMetrics && (
        <div className="flex gap-3 mb-4 text-sm">
          <div>
            <span className="text-green-600 font-semibold">{result.sentimentMetrics.positive}</span>
            <span className="text-gray-600"> positive</span>
          </div>
          <div>
            <span className="text-yellow-600 font-semibold">{result.sentimentMetrics.neutral}</span>
            <span className="text-gray-600"> neutral</span>
          </div>
          <div>
            <span className="text-red-600 font-semibold">{result.sentimentMetrics.negative}</span>
            <span className="text-gray-600"> negative</span>
          </div>
        </div>
      )}

      {/* Sentiment Summary */}
      <p className="text-gray-700 mb-4 text-sm leading-relaxed">
        <a
          href={result.redditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {result.sentimentSummary}
        </a>
      </p>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-200 pt-3">
        <span className="bg-gray-100 px-2 py-1 rounded">r/{result.subreddit}</span>
        <span>{result.postAge}</span>
      </div>
    </div>
  );
}
