import { SocialShare } from "@/components/SocialShare";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Volume2, Link as LinkIcon } from "lucide-react";
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
  const [sourceLinks, setSourceLinks] = useState<string[]>([]);

  useEffect(() => {
    if (article) {
      setImageUrl(article.imageurl || '');
      setAudioUrl(article.audiourl || '');
      setImageError(false);
      setAudioError(false);

      // Parse source links from article data
      try {
        if (article.sourcelinks) {
          console.log('Raw sourcelinks:', article.sourcelinks); // Debug log
          const links = JSON.parse(article.sourcelinks);
          console.log('Parsed sourcelinks:', links); // Debug log
          setSourceLinks(Array.isArray(links) ? links : []);
        } else {
          setSourceLinks([]);
        }
      } catch (e) {
        console.error('Error parsing source links:', e);
        setSourceLinks([]);
      }
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
    <div className="container mx-auto px-4 py-8 max-w-4xl cyber-grid">
      <Card className="mx-auto overflow-hidden neon-border backdrop-blur-sm bg-background/40 relative">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary/30 rounded-full blur-sm"></div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-primary/20 rounded-full blur-md"></div>
        <CardContent className="p-8">
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
                {article?.title}
              </motion.h1>

              {article && !article.isdraft && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <VerifiedBadge />
                </motion.div>
              )}
            </div>


            {article && (
              <>
                <motion.div
                  className="text-sm text-muted-foreground mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  By {article.authoraddress}
                </motion.div>

                {/* Audio Player Section */}
                {audioUrl && (
                  <motion.div
                    className="mb-8 neon-border bg-primary/5 rounded-lg p-5 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative float-element">
                        <Volume2 className="h-6 w-6 text-primary" />
                        <motion.div 
                          className="absolute inset-0 text-primary" 
                          animate={{ 
                            opacity: [0.5, 0.2, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "loop"
                          }}
                        >
                          <Volume2 className="h-6 w-6" />
                        </motion.div>
                      </div>
                      <span className="text-sm font-medium tracking-wide glow-text">AUDIO VERSION</span>
                    </div>
                    <div className="bg-background/30 rounded-md p-3 border border-primary/20">
                      <audio
                        controls
                        className="w-full"
                        src={audioUrl}
                        onError={handleAudioError}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </motion.div>
                )}

                {/* Main Image */}
                {imageUrl && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    className="mb-10 relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg opacity-60 z-10"></div>
                    <div className="absolute inset-0 neon-border rounded-lg z-20 pointer-events-none"></div>
                    <img
                      src={imageUrl}
                      alt={article.title}
                      className="w-full h-72 md:h-96 object-cover rounded-lg hover:scale-[1.02] transition-transform duration-700 shadow-xl"
                      onError={handleImageError}
                    />
                    {!article.isdraft && (
                      <div className="absolute bottom-4 right-4 z-30">
                        <div className="bg-background/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono border border-primary/30 flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                          <span>blockchain_verified</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Article Content */}
                <motion.div
                  className="prose prose-invert max-w-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {article.content.split('\n\n').map((paragraph, index) => (
                    <motion.p
                      key={index}
                      className="mb-6 leading-relaxed hover:text-primary/90 transition-colors duration-300 p-4 rounded-lg hover:bg-primary/5 cursor-text selection:bg-primary/20 selection:text-primary text-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.8 + index * 0.1,
                        type: "spring",
                        stiffness: 400,
                        damping: 30
                      }}
                      whileHover={{
                        scale: 1.01,
                        transition: { duration: 0.2 }
                      }}
                    >
                      {paragraph.trim()}
                    </motion.p>
                  ))}
                </motion.div>

                {/* Source Links Section */}
                {sourceLinks.length > 0 && (
                  <motion.div
                    className="my-8 neon-border cyber-grid rounded-xl p-6 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="relative">
                        <LinkIcon className="h-7 w-7 text-primary" />
                        <motion.div 
                          className="absolute inset-0 text-primary" 
                          animate={{ 
                            opacity: [0.5, 0.2, 0.5],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "loop"
                          }}
                        >
                          <LinkIcon className="h-7 w-7" />
                        </motion.div>
                      </div>
                      <h2 className="text-xl font-bold glow-text">
                        Reference Sources
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {sourceLinks.map((link, index) => {
                        let domain = '';
                        try {
                          const url = new URL(link);
                          domain = url.hostname.replace('www.', '');
                        } catch (error) {
                          console.error('Invalid URL:', link);
                          domain = link.replace(/(^\w+:|^)\/\//, '').split('/')[0];
                        }

                        return (
                          <motion.div
                            key={index}
                            className="relative overflow-hidden rounded-lg"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                          >
                            <a
                              href={link}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block group web3-link"
                            >
                              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3 relative group-hover:bg-primary/20 transition-all duration-300">
                                <div className="float-element" style={{ animationDelay: `${index * 0.1}s` }}>
                                  <LinkIcon className="h-5 w-5 text-primary group-hover:text-white transition-colors duration-300" />
                                </div>
                                <span className="truncate font-medium flex-1 text-white/90 group-hover:text-white transition-colors duration-300">
                                  {domain}
                                </span>
                                <span className="text-sm text-primary/70 group-hover:text-white/90 transition-colors duration-300 whitespace-nowrap font-mono">
                                  visit_source ↗
                                </span>
                              </div>
                            </a>
                            <motion.div
                              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary via-primary/80 to-primary/40"
                              initial={{ width: "0%" }}
                              whileHover={{ width: "100%" }}
                              transition={{ duration: 0.3 }}
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Video Section */}
                {article?.videourl && (
                  <motion.div
                    className="my-12 rounded-xl overflow-hidden shadow-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Video Demonstration
                    </h2>
                    <div className="relative group rounded-xl overflow-hidden">
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                        poster={imageUrl}
                      >
                        <source
                          src={article.videourl}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute bottom-4 right-4 text-white/90 font-semibold px-4 py-2 bg-black/70 rounded-lg backdrop-blur-sm">
                        buildersacademy.ai
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Share Section */}
                <motion.div
                  className="border-t pt-6 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.95 }}
                >
                  <h3 className="text-lg font-semibold mb-4">Share this article</h3>
                  <SocialShare
                    url={window.location.href}
                    title={article.title}
                  />
                </motion.div>
              </>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}