import { ArticleCard } from "@/components/ArticleCard";
import { CardSkeleton } from "@/components/CardSkeleton";
import { useQuery } from "@tanstack/react-query";
import type { SelectArticle } from "@db/schema";
import { motion } from "framer-motion";
import { Bot, Sparkles, Scale3D } from "lucide-react";

export function Home() {
  const { data: articles, isLoading } = useQuery<SelectArticle[]>({ 
    queryKey: ["/api/articles"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="min-h-screen cyber-grid">
      {/* Hero section with 3D elements */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-12 text-center relative"
      >
        <div className="absolute top-10 left-1/4 opacity-20 float-element">
          <Scale3D className="w-16 h-16 text-primary" />
        </div>
        <div className="absolute bottom-0 right-1/4 opacity-20 float-element" style={{ animationDelay: "1s" }}>
          <Sparkles className="w-14 h-14 text-primary" />
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 glow-text">
          Web3 Content Revolution
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          AI-powered content generation with blockchain verification for the next generation of digital creators
        </p>
        
        <div className="flex items-center justify-center gap-8 mb-16">
          <div className="flex items-center gap-2 bg-primary/10 p-3 rounded-lg border border-primary/30">
            <Bot className="w-5 h-5 text-primary" />
            <span>AI Generated</span>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 p-3 rounded-lg border border-primary/30">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Blockchain Verified</span>
          </div>
        </div>
      </motion.div>

      {/* Articles grid with 3D effect cards */}
      <div className="container mx-auto px-4 pb-16 max-w-7xl">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <Bot className="w-6 h-6 mr-2 text-primary float-element" />
          <span>Latest Articles</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {isLoading ? (
            // Show 6 skeleton cards while loading
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card-3d">
                <CardSkeleton />
              </div>
            ))
          ) : (
            articles?.map((article, index) => (
              <motion.div 
                key={article.id} 
                className="card-3d"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ArticleCard article={article} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}