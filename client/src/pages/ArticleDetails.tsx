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
        <div className="relative">
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
          <ArticleDetailsSkeleton />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card 
          className="mx-auto overflow-hidden backdrop-blur-sm relative" 
          style={{
            backgroundColor: "#0e0e1a",
            backgroundImage: "linear-gradient(to bottom right, rgba(30, 30, 47, 0.8), rgba(20, 20, 33, 0.95))",
            border: "1px solid rgba(108, 75, 255, 0.3)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(108, 75, 255, 0.2)",
            borderRadius: "0.75rem"
          }}
        >
          <CardContent className="p-16">
            <div 
              className="text-center text-xl text-gray-300 py-12"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Article not found or has been removed
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
      <Card 
        className="mx-auto overflow-hidden backdrop-blur-sm relative" 
        style={{
          backgroundColor: "#0e0e1a",
          backgroundImage: "linear-gradient(to bottom right, rgba(30, 30, 47, 0.8), rgba(20, 20, 33, 0.95))",
          border: "1px solid rgba(108, 75, 255, 0.3)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(108, 75, 255, 0.2)",
          borderRadius: "0.75rem"
        }}
      >
        {/* Card Glows - Hidden on small screens, visible on larger screens */}
        <div className="hidden md:block absolute -bottom-20 -right-20 w-40 md:w-60 h-40 md:h-60 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="hidden md:block absolute -top-20 -left-20 w-40 md:w-60 h-40 md:h-60 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 md:w-24 h-1 bg-primary/30 rounded-full blur-sm"></div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 md:w-32 h-1 bg-primary/20 rounded-full blur-md"></div>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Title Section with Verified Badge */}
            <div className="flex flex-col gap-2 mb-4">
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
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
                  className="mb-2"
                >
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-900/60 text-white border border-green-500/30">
                    <svg className="w-3.5 h-3.5 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Verified Content
                  </span>
                </motion.div>
              )}
            </div>


            {article && (
              <>
                <motion.div
                  className="mb-6 flex items-center gap-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-gray-400 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>By</span>
                  <span 
                    className="py-0.5 px-2 rounded flex items-center gap-1 text-sm"
                    style={{ 
                      color: "var(--color-secondary)",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500
                    }}
                  >
                    <span className="hidden md:inline">{article.authoraddress}</span>
                    <span className="md:hidden">
                      {article.authoraddress.slice(0, 6)}...{article.authoraddress.slice(-4)}
                    </span>
                  </span>
                </motion.div>

                {/* Audio Player Section */}
                {audioUrl && (
                  <motion.div
                    className="mb-8 rounded-lg p-3 sm:p-5"
                    style={{
                      backgroundColor: "rgba(20, 20, 35, 0.7)",
                      border: "1px solid rgba(108, 75, 255, 0.2)",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)"
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ scale: 1.005 }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <Volume2 className="h-4 w-4 sm:h-6 sm:w-6 text-secondary" />
                      <span 
                        className="text-xs sm:text-sm font-medium tracking-wide text-white"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        AUDIO VERSION
                      </span>
                    </div>
                    <div className="rounded-md p-2 sm:p-3" style={{ backgroundColor: "rgba(30, 30, 47, 0.6)" }}>
                      <audio
                        controls
                        className="w-full"
                        src={audioUrl}
                        onError={handleAudioError}
                        style={{ 
                          height: "30px", 
                          maxWidth: "100%",
                          borderRadius: "0.375rem" 
                        }}
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
                    <div className="overflow-hidden rounded-lg w-full mx-auto" style={{ maxHeight: "400px" }}>
                      <div className="relative overflow-hidden" style={{ borderRadius: "0.5rem" }}>
                        <img
                          src={imageUrl}
                          alt={article.title}
                          className="w-full h-auto object-cover rounded-lg hover:scale-[1.02] transition-transform duration-700"
                          style={{ objectPosition: "center" }}
                          onError={handleImageError}
                        />
                        {/* Stronger grid overlay effect like the sample image */}
                        <div 
                          className="absolute inset-0" 
                          style={{
                            backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMjAgMCBMIDAgMCAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMzAsIDMwLCAxMjAsIDAuMylAIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiPjwvcmVjdD48L3N2Zz4=')",
                            backgroundSize: "cover, 40px 40px",
                            backgroundPosition: "center, center"
                          }}
                        />
                        {!article.isdraft && (
                          <div className="absolute bottom-4 right-4 z-30">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-900/60 text-white border border-green-500/30">
                              <svg className="w-3.5 h-3.5 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                              Blockchain Verified
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
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
                      className="mb-6 leading-relaxed text-gray-300 p-2 sm:p-4 rounded-lg hover:bg-primary/5 text-base sm:text-lg"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.6 + index * 0.1,
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                      whileHover={{
                        scale: 1.005,
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
                    className="my-6 sm:my-8 p-3 sm:p-6 rounded-xl"
                    style={{
                      backgroundColor: "rgba(20, 20, 35, 0.7)",
                      border: "1px solid rgba(108, 75, 255, 0.2)",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)"
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                      <div className="relative">
                        <LinkIcon className="h-4 w-4 sm:h-6 sm:w-6 text-secondary" />
                      </div>
                      <h2 
                        className="text-lg sm:text-xl font-bold text-white"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
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
                              className="block group"
                            >
                              <div 
                                className="p-2 sm:p-3 rounded-lg flex items-center gap-2 sm:gap-3 relative transition-all duration-300"
                                style={{ 
                                  backgroundColor: "rgba(30, 30, 47, 0.6)",
                                  border: "1px solid rgba(0, 209, 193, 0.2)"
                                }}
                              >
                                <LinkIcon className="h-4 w-4 text-secondary" />
                                <span 
                                  className="truncate font-medium flex-1 text-gray-300"
                                  style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                  {domain}
                                </span>
                                <span 
                                  className="text-xs whitespace-nowrap"
                                  style={{ color: "var(--color-secondary)" }}
                                >
                                  Visit Source ↗
                                </span>
                              </div>
                            </a>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Video Section */}
                {article?.videourl && (
                  <motion.div
                    className="my-6 sm:my-12 rounded-xl overflow-hidden shadow-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Video Demonstration
                    </h2>
                    <div className="relative group rounded-xl overflow-hidden">
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-[200px] sm:h-[300px] md:h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
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
                  className="mt-10 pt-6 border-t border-primary/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.85 }}
                >
                  <h3 
                    className="text-lg font-bold mb-4 text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Share this article
                  </h3>
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