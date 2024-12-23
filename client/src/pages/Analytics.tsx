import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArticleCard } from "@/components/ArticleCard";
import { Loader2 } from "lucide-react";
import type { SelectArticle } from "@db/schema";

interface AnalyticsData {
  articles: SelectArticle[];
  totalArticles: number;
  authorStats: { address: string; count: number }[];
  topKeywords: { keyword: string; count: number }[];
}

export function Analytics() {
  const { data, isLoading } = useQuery<AnalyticsData>({ 
    queryKey: ["/api/analytics"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Platform Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Total Published Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{data?.totalArticles || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.authorStats.map((author) => (
                <div key={author.address} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {author.address.slice(0, 6)}...{author.address.slice(-4)}
                  </span>
                  <span className="font-semibold">{author.count} articles</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data?.topKeywords.map((keyword) => (
                <span
                  key={keyword.keyword}
                  className="px-2 py-1 bg-primary/10 rounded-full text-sm"
                >
                  {keyword.keyword} ({keyword.count})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">Recent Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
