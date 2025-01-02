import { ArticleCard } from "@/components/ArticleCard";
import { CardSkeleton } from "@/components/CardSkeleton";
import { useQuery } from "@tanstack/react-query";
import type { SelectArticle } from "@db/schema";

export function Home() {
  const { data: articles, isLoading } = useQuery<SelectArticle[]>({ 
    queryKey: ["/api/articles"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
        {isLoading ? (
          // Show 6 skeleton cards while loading
          Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))
        ) : (
          articles?.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))
        )}
      </div>
    </div>
  );
}