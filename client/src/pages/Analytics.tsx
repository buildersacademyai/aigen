import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ArticleAnalytics } from "@db/schema";
import { Loader2, Calendar, User, Tag } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";

// Function to extract keywords from content
function extractKeywords(content: string): string[] {
  // Split into words and filter out common words
  const commonWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at']);
  const words = content.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  // Get top 5 keywords
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

interface MonthlyStats {
  month: string;
  count: number;
}

function formatMonthData(articles: ArticleAnalytics[]): MonthlyStats[] {
  const monthCounts = new Map<string, number>();
  
  articles.forEach(article => {
    const date = new Date(article.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
  });

  // Sort by month and convert to array
  return Array.from(monthCounts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, count }));
}

export function Analytics() {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  
  const { data: articles = [], isLoading, isError, error } = useQuery<ArticleAnalytics[]>({
    queryKey: ["/api/articles/analytics"],
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
    select: (data) => {
      // Ensure we always return an array and process dates
      const processedData = Array.isArray(data) ? data : [];
      return processedData.map(article => ({
        ...article,
        createdAt: new Date(article.createdAt)
      }));
    }
  });

  // Update monthly stats when articles data changes
  useEffect(() => {
    if (articles && articles.length > 0) {
      setMonthlyStats(formatMonthData(articles));
    }
  }, [articles]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Content Analytics</h1>
        <Card>
          <CardContent className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Content Analytics</h1>
        <Card>
          <CardContent className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg text-destructive mb-2">Failed to load analytics data</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Please try again later"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Content Analytics</h1>
        <Card>
          <CardContent className="flex justify-center items-center min-h-[400px]">
            <p className="text-lg text-muted-foreground">No content available for analysis</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Content Analytics</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Generation Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary)/0.1)" />
                  <XAxis 
                    dataKey="month"
                    stroke="hsl(var(--primary))"
                    fontSize={12}
                    tick={{ fill: "hsl(var(--primary))" }}
                  />
                  <YAxis
                    stroke="hsl(var(--primary))"
                    fontSize={12}
                    tick={{ fill: "hsl(var(--primary))" }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--primary))",
                      borderRadius: "var(--radius)",
                      color: "hsl(var(--primary))"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monthlyStats[monthlyStats.length - 1]?.count || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Article Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles.map((article) => {
                const keywords = extractKeywords(article.content || '');
                return (
                  <div key={article.id} className="p-6 rounded-lg border border-border bg-card">
                    <h3 className="text-xl font-semibold mb-3">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {article.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        <span>Published by: </span>
                        <span className="font-mono">
                          {article.authorAddress.slice(0, 6)}...{article.authorAddress.slice(-4)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>Published on: </span>
                        <span>
                          {format(new Date(article.createdAt), 'PPP')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span className="text-sm">Keywords: </span>
                      <div className="flex flex-wrap gap-2">
                        {keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}