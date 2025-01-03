import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { signMessage } from "@/lib/web3";
import type { SelectArticle } from "@db/schema";
import { Loader2, Wallet } from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3"; // Add this import

interface EditArticleFormProps {
  article: SelectArticle;
  onSuccess?: () => void;
}

export function EditArticleForm({ article, onSuccess }: EditArticleFormProps) {
  const { address, connect } = useWeb3(); // Add this hook
  const form = useForm({
    defaultValues: {
      title: article.title,
      description: article.description,
      content: article.content,
    },
  });

  const { toast } = useToast();

  const updateArticle = useMutation({
    mutationFn: async (data: any) => {
      if (!address) {
        throw new Error("Please connect your wallet to edit articles");
      }

      const response = await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update article");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Article updated successfully",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const publishArticle = useMutation({
    mutationFn: async () => {
      if (!address) {
        throw new Error("Please connect your wallet to publish articles");
      }

      // Sign the message before publishing
      const signature = await signMessage(address, "Verified content");

      // Get the source links from the article data
      let sourceLinks: string[] = [];
      try {
        if (article.sourcelinks) {
          sourceLinks = JSON.parse(article.sourcelinks);
        }
      } catch (error) {
        console.error('Error parsing source links:', error);
      }

      const response = await fetch(`/api/articles/${article.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature,
          sourceLinks
        })
      });

      if (!response.ok) {
        throw new Error("Failed to publish article");
      }

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
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    updateArticle.mutate(data);
  });

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <Wallet className="h-12 w-12 text-primary" />
        <h2 className="text-xl font-semibold">Connect Wallet to Edit</h2>
        <p className="text-sm text-muted-foreground text-center mb-4">
          You need to connect your wallet to edit or publish articles
        </p>
        <Button onClick={connect}>
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea className="min-h-[200px]" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={updateArticle.isPending}
            className="flex-1"
          >
            {updateArticle.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Draft"
            )}
          </Button>

          <Button
            type="button"
            onClick={() => publishArticle.mutate()}
            disabled={publishArticle.isPending}
            className="flex-1"
          >
            {publishArticle.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </span>
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}