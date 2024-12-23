import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SelectArticle } from "@db/schema";
import { Loader2 } from "lucide-react";

export function Analytics() {
  const { data: articles, isLoading } = useQuery<SelectArticle[]>({
    queryKey: ["/api/articles/analytics"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Extract unique publishers
  const publishers = new Set(articles?.map(article => article.authorAddress) || []);
  
  // Extract keywords from titles and content
  const keywords = articles?.reduce((acc: Map<string, number>, article) => {
    const words = article.title.toLowerCase().split(/\W+/)
      .concat(article.content.toLowerCase().split(/\W+/));
    
    words.forEach(word => {
      if (word.length > 3) { // Only count words longer than 3 characters
        acc.set(word, (acc.get(word) || 0) + 1);
      }
    });
    return acc;
  }, new Map<string, number>());

  // Get top 10 keywords
  const topKeywords = Array.from(keywords?.entries() || [])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Published Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{articles?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unique Publishers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{publishers.size}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topKeywords.map(([keyword, count]) => (
                <li key={keyword} className="flex justify-between items-center">
                  <span className="font-medium">{keyword}</span>
                  <span className="text-muted-foreground">{count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
