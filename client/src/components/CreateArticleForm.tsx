import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { generateArticle } from "@/lib/openai";
import { signMessage } from "@/lib/web3";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface CreateArticleFormProps {
  address: string;
  onSuccess?: () => void;
}

interface FormData {
  topic: string;
  title?: string;
  content?: string;
  description?: string;
}

export function CreateArticleForm({ address, onSuccess }: CreateArticleFormProps) {
  const [draftArticle, setDraftArticle] = useState<any>(null);
  const form = useForm<FormData>();
  const { toast } = useToast();

  const generateDraft = useMutation({
    mutationFn: async (data: FormData) => {
      const article = await generateArticle(data.topic);
      return article;
    }
  });

  const saveAsDraft = useMutation({
    mutationFn: async (article: any) => {
      const signature = await signMessage(address, "Draft content");
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...article,
          authorAddress: address,
          signature,
          isDraft: true
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      return response.json();
    }
  });

  const onSubmit = form.handleSubmit((data) => {
    generateDraft.mutate(data, {
      onSuccess: (article) => {
        setDraftArticle(article);
        toast({
          title: "Draft Created",
          description: "Review and edit your article before publishing"
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  });

  const onSaveAsDraft = async () => {
    if (!draftArticle) return;
    
    saveAsDraft.mutate(draftArticle, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Article saved as draft"
        });
        form.reset();
        setDraftArticle(null);
        onSuccess?.();
        window.location.href = '/profile';
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const steps = [
    { id: 1, title: "Generating article content" },
    { id: 2, title: "Creating article image" },
    { id: 3, title: "Publishing to blockchain" }
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

        {generateDraft.isPending && (
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

        {!draftArticle ? (
          <Button 
            type="submit" 
            disabled={generateDraft.isPending}
            className="w-full"
          >
            {generateDraft.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Draft...
              </span>
            ) : (
              "Generate Draft"
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">{draftArticle.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{draftArticle.description}</p>
              <div className="text-sm text-muted-foreground">
                Content preview: {draftArticle.content.slice(0, 200)}...
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setDraftArticle(null)}
                variant="outline"
                className="flex-1"
              >
                Discard
              </Button>
              <Button
                onClick={onSaveAsDraft}
                disabled={saveAsDraft.isPending}
                className="flex-1"
              >
                {saveAsDraft.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Draft...
                  </span>
                ) : (
                  "Save as Draft"
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}