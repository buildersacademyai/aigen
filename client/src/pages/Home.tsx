import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Home page component - Landing page
 * This is a placeholder for the future home page
 * Will be developed later with proper content
 */
export function Home() {
  return (
    <div className="min-h-screen cyber-grid">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-16 sm:py-32 text-center"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 glow-text">
          Future Home Page
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
          This page will be developed later as a landing page
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            asChild
            size="lg" 
            className="flex items-center gap-2 text-lg" 
            style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 0 15px rgba(108, 75, 255, 0.3)'
            }}
          >
            <Link href="/articles">
              <span>View Articles</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}