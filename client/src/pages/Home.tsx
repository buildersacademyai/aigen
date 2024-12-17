import { ArticleCard } from "@/components/ArticleCard";
import { CreateArticleForm } from "@/components/CreateArticleForm";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: articles } = useQuery({ queryKey: ["/api/articles"] });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Latest Articles</h1>
        <Button onClick={() => setIsOpen(true)}>Create Article</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles?.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
          </DialogHeader>
          <CreateArticleForm address={window.ethereum?.selectedAddress || "0x0"} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
