import { ArticleCard } from "@/components/ArticleCard";
import { CardSkeleton } from "@/components/CardSkeleton";
import { useQuery } from "@tanstack/react-query";
import type { SelectArticle } from "@db/schema";
import { motion } from "framer-motion";
import { Bot, Sparkles, Scale3D, ScrollText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function Articles() {
  const isMobile = useIsMobile();
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
        className="container mx-auto px-4 py-6 sm:py-10 text-center relative"
      >
        <div className="absolute top-10 left-1/4 opacity-20 float-element hidden sm:block">
          <ScrollText className="w-12 sm:w-16 h-12 sm:h-16 text-primary" />
        </div>
        <div className="absolute bottom-0 right-1/4 opacity-20 float-element hidden sm:block" style={{ animationDelay: "1s" }}>
          <Sparkles className="w-10 sm:w-14 h-10 sm:h-14 text-primary" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 glow-text">
          AI-Generated Articles
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8">
          Blockchain-verified content created by advanced AI algorithms and human curation
        </p>
      </motion.div>

      {/* Articles grid with 3D effect cards */}
      <div className="container mx-auto px-4 pb-8 sm:pb-16 max-w-7xl">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-8 flex items-center">
          <Bot className="w-5 sm:w-6 h-5 sm:h-6 mr-2 text-primary float-element" />
          <span>Browse Articles</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 justify-center">
          {isLoading ? (
            // Show skeleton cards while loading - fewer on mobile
            Array.from({ length: isMobile ? 3 : 6 }).map((_, index) => (
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
                transition={{ duration: 0.4, delay: Math.min(index * 0.1, 0.5) }}
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
