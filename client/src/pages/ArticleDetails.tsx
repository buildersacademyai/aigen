import { SocialShare } from "@/components/SocialShare";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { SelectArticle } from "@db/schema";

interface ArticleProps {
  params: { id: string };
}

export function ArticleDetails({ params }: ArticleProps) {
  const { data: article, isLoading } = useQuery<SelectArticle>({ 
    queryKey: [`/api/articles/${params.id}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mx-auto">
          <CardContent className="p-6">
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mx-auto">
          <CardContent className="p-6">
            <div className="text-center text-lg">Article not found</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mx-auto overflow-hidden">
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-64 object-cover rounded-lg mb-6 hover:scale-[1.02] transition-transform duration-300"
            />
            
            {article.videoUrl && (
              <motion.div 
                className="mt-6 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h2 className="text-xl font-semibold mb-3">Featured Video</h2>
                <div className="relative group">
                  <video
                    src={article.videoUrl}
                    poster={article.videoUrl}
                    controls
                    className="w-full h-[400px] object-cover rounded-lg hover:scale-[1.02] transition-transform duration-300 shadow-lg"
                  >
                    <source src={article.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute bottom-4 right-4 text-white/80 font-semibold px-2 py-1 bg-black/50 rounded text-sm">
                    BuildersAcademy
                  </div>
                </div>
              </motion.div>
            )}

            <motion.h1 
              className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 hover:to-primary transition-all duration-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {article.title}
            </motion.h1>

            <motion.div 
              className="text-sm text-muted-foreground mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              By {article.authorAddress.slice(0, 6)}...{article.authorAddress.slice(-4)}
            </motion.div>

            <motion.div 
              className="prose prose-invert max-w-none mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {article.content.split('\n\n').map((paragraph, index) => (
                <motion.p 
                  key={index} 
                  className="mb-4 leading-relaxed hover:text-primary/90 transition-colors duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {paragraph.trim()}
                </motion.p>
              ))}
            </motion.div>

            <motion.div 
              className="border-t pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold mb-4">Share this article</h3>
              <SocialShare
                url={window.location.href}
                title={article.title}
              />
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
