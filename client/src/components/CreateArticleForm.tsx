import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { generateArticle } from "@/lib/openai";
import { useMutation } from "@tanstack/react-query";
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
  const form = useForm<FormData>({
    defaultValues: {
      topic: ''
    }
  });
  const { toast } = useToast();

  const createArticle = useMutation({
    mutationFn: async (data: FormData) => {
      // First generate the article
      const article = await generateArticle(data.topic);

      // Then save it as draft
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...article,
          authorAddress: address,
          signature: "", // Empty signature for drafts
          isDraft: true
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Article created and saved as draft"
      });
      form.reset();
      window.location.href = '/profile';
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
    toast({
      title: "Starting Generation",
      description: "Please wait while we generate your article...",
    });
    createArticle.mutate(data);
  });

  const steps = [
    { id: 1, title: "Generating article content" },
    { id: 2, title: "Creating article image" },
    { id: 3, title: "Saving as draft" }
  ];

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6" aria-describedby="create-article-description"> {/* Added aria-describedby */}
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="topic-input">Topic</FormLabel> {/* Added htmlFor */}
              <FormControl>
                <Input id="topic-input" placeholder="Enter article topic" {...field} aria-label="Article Topic" /> {/* Added aria-label */}
              </FormControl>
            </FormItem>
          )}
        />
        <p id="create-article-description">Enter a topic to generate an AI-powered article</p> {/* Added description */}

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