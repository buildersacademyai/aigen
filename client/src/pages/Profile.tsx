import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArticleCard } from "@/components/ArticleCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditArticleForm } from "@/components/EditArticleForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import type { SelectArticle } from "@db/schema";
import { signMessage } from "@/lib/web3";

interface ProfileProps {
  address: string;
}

export function Profile({ address }: ProfileProps) {
  const [editingArticle, setEditingArticle] = useState<SelectArticle | null>(null);
  const { toast } = useToast();

  const { data: drafts, isLoading: draftsLoading } = useQuery<SelectArticle[]>({
    queryKey: [`/api/articles/drafts/${address}`],
  });

  const { data: published, isLoading: publishedLoading } = useQuery<SelectArticle[]>({
    queryKey: [`/api/articles/published/${address}`],
  });

  const deleteDraft = useMutation({
    mutationFn: async (articleId: number) => {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete article");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete article",
        variant: "destructive",
      });
    },
  });

  const publishArticle = useMutation({
    mutationFn: async (article: SelectArticle) => {
      // Sign the message before publishing
      const signature = await signMessage(address, "Verified content");
      
      const response = await fetch(`/api/articles/${article.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature })
      });

      if (!response.ok) throw new Error("Failed to publish article");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Article published successfully",
      });
      window.location.href = '/';
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to publish article",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">My Content</h1>
      
      <Tabs defaultValue="drafts" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>

        <TabsContent value="drafts">
          {draftsLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : drafts?.length === 0 ? (
            <p className="text-center text-muted-foreground">No drafts yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drafts?.map((article) => (
                <ArticleCard 
                  key={article.id}
                  article={article}
                  showActions
                  onEdit={setEditingArticle}
                  onDelete={(id) => deleteDraft.mutate(id)}
                  onPublish={(article) => publishArticle.mutate(article)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="published">
          {publishedLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : published?.length === 0 ? (
            <p className="text-center text-muted-foreground">No published articles yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {published?.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingArticle} onOpenChange={() => setEditingArticle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
          </DialogHeader>
          {editingArticle && (
            <EditArticleForm 
              article={editingArticle}
              onSuccess={() => setEditingArticle(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
