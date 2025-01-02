import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { generateArticle } from "@/lib/openai";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface CreateArticleFormProps {
  address: string;
  onSuccess?: () => void;
}

interface FormData {
  topic: string;
}

export function CreateArticleForm({ address, onSuccess }: CreateArticleFormProps) {
  const form = useForm<FormData>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createArticle = useMutation({
    mutationFn: async (data: FormData) => {
      // First generate the article
      const article = await generateArticle(data.topic);

      // Then save it as draft - ensure property names match database columns
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          description: article.description,
          imageurl: article.imageUrl,
          thumbnailurl: article.thumbnailUrl,
          videourl: article.videoUrl || '',
          audiourl: article.audioUrl || '',  
          audioduration: article.audioDuration || 0,  
          authoraddress: address,  
          signature: "", 
          isdraft: true,
          videoduration: 15,
          hasbackgroundmusic: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create article");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate both drafts and published articles queries
      queryClient.invalidateQueries({ queryKey: [`/api/articles/drafts/${address}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });

      toast({
        title: "Success",
        description: "Article created and saved as draft"
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create article",
        variant: "destructive"
      });
    }
  });

  const onSubmit = form.handleSubmit((data) => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Starting Generation",
      description: "Please wait while we generate your article...",
    });
    createArticle.mutate(data);
  });

  const steps = [
    { id: 1, title: "Generating article content" },
    { id: 2, title: "Creating article image" },
    { id: 3, title: "Generating audio narration" },
    { id: 4, title: "Saving as draft" }
  ];

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic</FormLabel>
              <FormControl>
                <Input placeholder="Enter article topic" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {createArticle.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                {step.title}
              </motion.div>
            ))}
          </motion.div>
        )}

        <Button 
          type="submit" 
          disabled={createArticle.isPending}
          className="w-full"
        >
          {createArticle.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Draft...
            </span>
          ) : (
            "Generate Article"
          )}
        </Button>
      </form>
    </Form>
  );
}