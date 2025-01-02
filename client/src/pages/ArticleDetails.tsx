import { SocialShare } from "@/components/SocialShare";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Volume2 } from "lucide-react";
import type { SelectArticle } from "@db/schema";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ArticleDetailsSkeleton } from "@/components/ArticleDetailsSkeleton";
import { useState, useEffect } from "react";

interface ArticleProps {
  params: { id: string };
}

export function ArticleDetails({ params }: ArticleProps) {
  const { data: article, isLoading } = useQuery<SelectArticle>({ 
    queryKey: [`/api/articles/${params.id}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const [imageUrl, setImageUrl] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    if (article) {
      setImageUrl(article.imageurl);
      setAudioUrl(article.audiourl || '');
      setImageError(false);
      setAudioError(false);
    }
  }, [article]);

  // Function to verify and potentially recover image
  const verifyImage = async () => {
    if (!imageUrl) return;

    try {
      const filename = imageUrl.split('/').pop();
      if (!filename) return;

      const response = await fetch(`/api/images/verify/${filename}`);
      if (!response.ok) {
        throw new Error('Failed to verify image');
      }

      const data = await response.json();
      if (data.path) {
        setImageUrl(`${data.path}?t=${Date.now()}`);
        setImageError(false);
      }
    } catch (error) {
      console.error('Error verifying image:', error);
      setTimeout(() => {
        if (imageError) {
          verifyImage();
        }
      }, 5000);
    }
  };

  // Function to verify and potentially recover audio
  const verifyAudio = async () => {
    if (!audioUrl) return;

    try {
      const filename = audioUrl.split('/').pop();
      if (!filename) return;

      const response = await fetch(`/api/audio/verify/${filename}`);
      if (!response.ok) {
        throw new Error('Failed to verify audio');
      }

      const data = await response.json();
      if (data.url) {
        setAudioUrl(`${data.url}?t=${Date.now()}`);
        setAudioError(false);
      }
    } catch (error) {
      console.error('Error verifying audio:', error);
      setTimeout(() => {
        if (audioError) {
          verifyAudio();
        }
      }, 5000);
    }
  };

  // Handle media errors
  const handleImageError = () => {
    setImageError(true);
    verifyImage();
  };

  const handleAudioError = () => {
    setAudioError(true);
    verifyAudio();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ArticleDetailsSkeleton />
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
            {/* Title Section with Verified Badge */}
            <div className="flex flex-col gap-2 mb-4">
              <motion.h1 
                className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 hover:to-primary transition-all duration-300 cursor-pointer select-none"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 10
                }}
              >
                {article.title}
              </motion.h1>

              {!article.isdraft && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <VerifiedBadge />
                </motion.div>
              )}
            </div>

            <motion.div 
              className="text-sm text-muted-foreground mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              By {article.authoraddress.slice(0, 6)}...{article.authoraddress.slice(-4)}
            </motion.div>

            {/* Audio Player Section */}
            {audioUrl && (
              <motion.div
                className="mb-6 bg-muted/30 rounded-lg p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Listen to Article</span>
                </div>
                <audio 
                  controls 
                  className="w-full"
                  src={audioUrl}
                  onError={handleAudioError}
                >
                  Your browser does not support the audio element.
                </audio>
              </motion.div>
            )}

            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <img
                src={imageUrl}
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg mb-6 hover:scale-[1.02] transition-transform duration-300"
                onError={handleImageError}
              />
            </motion.div>

            {/* Article Content */}
            <motion.div 
              className="prose prose-invert max-w-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {article.content.split('\n\n').map((paragraph, index) => (
                <motion.p 
                  key={index} 
                  className="mb-4 leading-relaxed hover:text-primary/90 transition-colors duration-200 p-2 rounded-md hover:bg-primary/5 cursor-text selection:bg-primary/20 selection:text-primary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  transition={{ 
                    delay: 0.7 + index * 0.1,
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                >
                  {paragraph.trim()}
                </motion.p>
              ))}
            </motion.div>

            {/* Video Section */}
            {article.videourl && (
              <motion.div 
                className="mt-6 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h2 className="text-xl font-semibold mb-3">Featured Video</h2>
                <div className="relative group">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-[400px] object-cover rounded-lg hover:scale-[1.02] transition-transform duration-300 shadow-lg"
                    poster={imageUrl}
                  >
                    <source 
                      src={article.videourl} 
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                  <div 
                    className="absolute bottom-4 right-4 text-white/80 font-semibold px-3 py-2 bg-black/60 rounded backdrop-blur-sm"
                  >
                    AIGen
                  </div>
                </div>
              </motion.div>
            )}

            {/* Share Section */}
            <motion.div 
              className="border-t pt-6 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
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