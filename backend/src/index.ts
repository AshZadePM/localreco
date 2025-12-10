import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ message: 'Backend is running' });
});

// Search endpoint
interface SearchRequest {
  city: string;
  query: string;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
}

app.post('/api/search', (req: Request, res: Response) => {
  const { city, query } = req.body as SearchRequest;

  // Validate request
  if (!city || !query) {
    res.status(400).json({ error: 'City and query are required' });
    return;
  }

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: `Result 1 for "${query}" in ${city}`,
      description: 'Sample result 1',
    },
    {
      id: '2',
      title: `Result 2 for "${query}" in ${city}`,
      description: 'Sample result 2',
    },
    {
      id: '3',
      title: `Result 3 for "${query}" in ${city}`,
      description: 'Sample result 3',
    },
  ];

  const response: SearchResponse = {
    results: mockResults,
    total: mockResults.length,
  };

  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
