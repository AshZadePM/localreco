import { useState } from 'react';
import { RestaurantResult } from '../types';
import { RestaurantCard } from './RestaurantCard';

interface ResultsViewProps {
  results: RestaurantResult[];
  isLoading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
}

const ITEMS_PER_PAGE = 5;

export function ResultsView({
  results,
  isLoading = false,
  error = null,
  onLoadMore,
}: ResultsViewProps) {
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);

  const displayedResults = results.slice(0, displayedCount);
  const hasMore = displayedCount < results.length;

  const handleLoadMore = () => {
    setDisplayedCount((prev) => prev + ITEMS_PER_PAGE);
    onLoadMore?.();
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-lg font-bold text-red-800 mb-2">Error Loading Results</h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (results.length === 0 && !isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <h2 className="text-lg font-bold text-blue-800 mb-2">No Results Found</h2>
        <p className="text-blue-700">Try adjusting your search criteria or filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedResults.map((result) => (
          <RestaurantCard key={result.id} result={result} />
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            Load More
          </button>
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && (
        <div className="text-center text-gray-600 text-sm">
          Showing {displayedResults.length} of {results.length} results
        </div>
      )}
    </div>
  );
}
