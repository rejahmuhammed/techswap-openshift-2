import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Input, Card, Loading } from '../components';
import { useProblemSolver, ruleBasedRecommendation } from '../hooks/useHooks';

function Home() {
  const [problem, setProblem] = useState('');
  const [results, setResults] = useState<{ categories: string[]; recommendations: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const solveMutation = useProblemSolver('');

  const handleSolve = async () => {
    if (!problem.trim()) return;
    setIsLoading(true);
    
    // The useProblemSolver mutation will fall back to rule-based on error
    await solveMutation.mutateAsync(problem);
    
    // Get the cached data from the mutation
    const cached = solveMutation.getCacheData();
    setResults(cached);
    
    setIsLoading(false);
  };

  return (
    <section className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <header className="text-center py-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
            TechSwap
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mt-4">
            Describe your electronic problem. We'll help you find what you need.
          </p>
        </header>

        {/* Problem Solver Form */}
        <div className="mt-8 max-w-lg mx-auto">
          <Card>
            <h2 className="text-xl font-medium text-gray-900 mb-4">What's wrong with your device?</h2>
            
            <Input
              type="textarea"
              placeholder="My laptop is very slow and I don't have enough storage."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={3}
              disabled={isLoading}
              className="w-full"
            />
            
            <Button
              onClick={handleSolve}
              disabled={isLoading || !problem.trim()}
              className="mt-4 w-full"
            >
              {isLoading ? 'Finding Solutions...' : 'Find Solutions'}
            </Button>
          </Card>
        </div>

        {/* AI Recommendations */}
        {results && (
          <div className="mt-10">
            <h2 className="text-xl font-medium text-gray-900 mb-6">AI Recommended Products</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.recommendations.map((rec, index) => (
                <Card
                  key={index}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    {rec.category}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {rec.reason}
                  </p>
                </Card>
              ))}
            </div>
            
            {/* Available products from marketplace */}
            {results.categories && results.categories.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-4">
                  TechSwap displays actual products from our marketplace:
                </p>
                <Card className="p-4 bg-gray-50">
                  <p className="text-xs text-gray-400">Kingston 1TB SSD - ₹3200</p>
                  <p className="text-xs text-gray-400">Crucial 1TB SSD - ₹3450</p>
                  <p className="text-xs text-gray-400">Samsung 1TB SSD - ₹3600 (New)</p>
                  <p className="text-xs text-gray-400">Samsung 1TB SSD - ₹2000 - Pre-Owned</p>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Popular Electronics Section */}
        {/* Would list popular products from marketplace */}
      </div>
    </section>
  );
}

export default Home;