import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArticleCard } from "@/components/ArticleCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditArticleForm } from "@/components/EditArticleForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCcw, Check, AlertCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SelectArticle } from "@db/schema";
import { signMessage } from "@/lib/web3";
import { resetAudioGenerationFlag } from "@/lib/openai";

interface ProfileProps {
  address: string;
}

// Schema for API key form
const apiKeySchema = z.object({
  apiKey: z.string().min(20, "API key must be at least 20 characters"),
});

type ApiKeyFormData = z.infer<typeof apiKeySchema>;

export function Profile({ address }: ProfileProps) {
  const [editingArticle, setEditingArticle] = useState<SelectArticle | null>(null);
  const [apiKeyTestResult, setApiKeyTestResult] = useState<any>(null);
  const [apiKeyTestLoading, setApiKeyTestLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const apiKeyForm = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: "",
    },
  });

  // Use useQuery to fetch draft articles
  const { data: drafts, isLoading: draftsLoading } = useQuery<SelectArticle[]>({
    queryKey: [`/api/articles/drafts/${address}`],
  });
  
  // For debugging, log drafts when they change
  useEffect(() => {
    if (drafts) {
      console.log(`Fetched ${drafts.length} drafts for address: ${address}`);
    }
  }, [drafts, address]);

  const { data: published, isLoading: publishedLoading } = useQuery<SelectArticle[]>({
    queryKey: [`/api/articles/published/${address}`],
  });
  
  // Function to test API key
  const testApiKey = async () => {
    setApiKeyTestLoading(true);
    try {
      const response = await fetch('/api/openai/test');
      const result = await response.json();
      setApiKeyTestResult(result);
      
      // Reset audio generation flags if API key is working
      if (result.results.some((r: { success: boolean }) => r.success)) {
        resetAudioGenerationFlag();
        toast({
          title: "Success",
          description: "API key is working for some models. Audio generation has been re-enabled.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not test API key",
        variant: "destructive",
      });
    } finally {
      setApiKeyTestLoading(false);
    }
  };
  
  // Mutation to update API key
  const updateApiKey = useMutation({
    mutationFn: async (data: ApiKeyFormData) => {
      const response = await fetch('/api/openai/update-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update API key');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "API key updated successfully. Testing new key...",
      });
      apiKeyForm.reset();
      
      // Reset audio generation flags
      resetAudioGenerationFlag();
      
      // Test the new key
      setTimeout(testApiKey, 1000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update API key",
        variant: "destructive",
      });
    },
  });

  const deleteDraft = useMutation({
    mutationFn: async (articleId: number) => {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete article");
        } catch (jsonError) {
          // If response is not JSON, use status text
          throw new Error(`Failed to delete article: ${response.statusText}`);
        }
      }
      
      try {
        // Try to parse JSON, but don't fail if it's not valid JSON
        return await response.json();
      } catch (e) {
        // Return a default success message if response is not JSON
        return { message: "Article deleted successfully" };
      }
    },
    onSuccess: () => {
      console.log("Delete mutation succeeded, invalidating queries...");
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
      
      // Force a hard reset of the cache for these queries
      queryClient.resetQueries({ queryKey: [`/api/articles/drafts/${address}`] });
      queryClient.resetQueries({ queryKey: [`/api/articles/published/${address}`] });
      
      // Force a window reload to ensure UI is updated
      setTimeout(() => {
        window.location.reload();
      }, 500);
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
      
      {/* API Key Management Section */}
      <Card className="mb-8 bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            API Key Management
          </CardTitle>
          <CardDescription>
            Update or test your OpenAI API key for article generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Form {...apiKeyForm}>
                <form 
                  onSubmit={apiKeyForm.handleSubmit((data) => updateApiKey.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={apiKeyForm.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OpenAI API Key</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="sk-..." 
                            type="password" 
                            autoComplete="off"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={updateApiKey.isPending}
                    className="w-full"
                  >
                    {updateApiKey.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update API Key
                  </Button>
                </form>
              </Form>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">API Key Status</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={apiKeyTestLoading}
                  onClick={testApiKey}
                >
                  {apiKeyTestLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="mr-2 h-4 w-4" />
                  )}
                  Test API Key
                </Button>
              </div>
              
              {apiKeyTestResult ? (
                <div className="rounded-md border p-3 text-sm">
                  <p className="mb-2">
                    <span className="font-semibold">Current API Key:</span>{" "}
                    {apiKeyTestResult.apiKeyFirstFour}***...{" "}
                    <Badge variant={apiKeyTestResult.isProjectKey ? "default" : "outline"}>
                      {apiKeyTestResult.isProjectKey ? "Project Key" : "Standard Key"}
                    </Badge>
                  </p>
                  
                  <div className="space-y-1 mt-2">
                    {apiKeyTestResult.results.map((result: {success: boolean, model: string}, i: number) => (
                      <div 
                        key={i} 
                        className={`flex items-center ${
                          result.success ? "text-green-500" : "text-amber-400"
                        }`}
                      >
                        {result.success ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mr-2" />
                        )}
                        <span>{result.model}: {result.success ? "✓" : "✗"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                  <p>Click "Test API Key" to check API key status</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
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
