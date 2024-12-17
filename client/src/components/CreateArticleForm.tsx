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

export function CreateArticleForm({ address, onSuccess }: CreateArticleFormProps) {
  const form = useForm();
  const { toast } = useToast();

  const createArticle = useMutation({
    mutationFn: async (data: { topic: string }) => {
      const article = await generateArticle(data.topic);
      const signature = await signMessage(address, "This content is verified");
      
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...article,
          authorAddress: address,
          signature
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create article");
      }

      return response.json();
    }
  });

  const onSubmit = form.handleSubmit((data) => {
    createArticle.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Article created successfully"
        });
        form.reset();
        onSuccess?.();
        window.location.href = '/';
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
              Generating...
            </span>
          ) : (
            "Generate Article"
          )}
        </Button>
      </form>
    </Form>
  );
}