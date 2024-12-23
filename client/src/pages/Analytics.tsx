import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SelectArticle } from "@db/schema";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface MonthlyStats {
  month: string;
  count: number;
}

function formatMonthData(articles: SelectArticle[]): MonthlyStats[] {
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
  
  const { data: articles = [], isLoading, isError, error } = useQuery<SelectArticle[]>({
    queryKey: ["/api/articles/analytics"],
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((article) => (
                <div key={article.id} className="p-4 rounded-lg border border-border bg-card">
                  <h3 className="font-semibold mb-2 line-clamp-1">{article.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {article.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex justify-between items-center">
                      <span>Created by: {article.authorAddress.slice(0, 6)}...{article.authorAddress.slice(-4)}</span>
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1">
                      Status: {article.isDraft ? 'Draft' : 'Published'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
