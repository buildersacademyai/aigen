import { ArticleCard } from "@/components/ArticleCard";
import { useQuery } from "@tanstack/react-query";
import type { SelectArticle } from "@db/schema";

export function Articles() {
  const { data: articles } = useQuery<SelectArticle[]>({ queryKey: ["/api/articles"] });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-center">All Articles</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
        {articles?.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
