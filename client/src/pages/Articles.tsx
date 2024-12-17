import { ArticleCard } from "@/components/ArticleCard";
import { useQuery } from "@tanstack/react-query";

export function Articles() {
  const { data: articles } = useQuery({ queryKey: ["/api/articles"] });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Articles</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles?.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
