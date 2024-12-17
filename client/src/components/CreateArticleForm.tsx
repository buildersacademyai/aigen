import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { generateArticle } from "@/lib/openai";
import { signMessage } from "@/lib/web3";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CreateArticleFormProps {
  address: string;
}

export function CreateArticleForm({ address }: CreateArticleFormProps) {
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

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
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
        <Button type="submit" disabled={createArticle.isPending}>
          {createArticle.isPending ? "Generating..." : "Generate Article"}
        </Button>
      </form>
    </Form>
  );
}
