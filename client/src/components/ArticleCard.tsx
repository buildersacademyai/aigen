import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import type { SelectArticle } from "@db/schema";
import { VerifiedBadge } from "@/components/VerifiedBadge";

interface ArticleCardProps {
  article: SelectArticle;
  showActions?: boolean;
  onEdit?: (article: SelectArticle) => void;
  onDelete?: (id: number) => void;
  onPublish?: (article: SelectArticle) => void;
}

export function ArticleCard({ article, showActions, onEdit, onDelete, onPublish }: ArticleCardProps) {
  const [, setLocation] = useLocation();
  const [imageUrl, setImageUrl] = useState(article.imageurl);
  // Use a temporary thumbnail state since it's not in the schema
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  useEffect(() => {
    // Reset state when article changes
    setImageUrl(article.imageurl);
    // Reset thumbnail (we're not using it but keeping the state for future use)
    setThumbnailUrl(null);
    setImageError(false);
    setThumbnailError(false);
  }, [article]);

  // Function to verify and potentially recover image
  const verifyImage = async (url: string | null, isThumbnail: boolean) => {
    if (!url) return;
    
    try {
      // Extract filename from imageUrl
      const filename = url.split('/').pop();
      if (!filename) return;

      const response = await fetch(`/api/images/verify/${filename}`);
      if (!response.ok) {
        throw new Error('Failed to verify image');
      }

      const data = await response.json();
      if (data.path) {
        // Add timestamp to bypass cache
        const newUrl = `${data.path}?t=${Date.now()}`;
        if (isThumbnail) {
          setThumbnailUrl(newUrl);
          setThumbnailError(false);
        } else {
          setImageUrl(newUrl);
          setImageError(false);
        }
      }
    } catch (error) {
      console.error('Error verifying image:', error);
      // If verification fails, try again after a delay
      setTimeout(() => {
        if ((isThumbnail && thumbnailError) || (!isThumbnail && imageError)) {
          verifyImage(url, isThumbnail);
        }
      }, 5000);
    }
  };

  // Handle image load error
  const handleImageError = (isThumbnail: boolean = false) => {
    if (isThumbnail) {
      setThumbnailError(true);
      // Just use the main image instead
      verifyImage(imageUrl, true);
    } else {
      setImageError(true);
      verifyImage(article.imageurl, false);
    }
  };

  return (
    <Card 
      className="overflow-hidden relative card-3d backdrop-blur-sm cursor-pointer"
      onClick={() => !showActions && setLocation(`/article/${article.id}`)}
      style={{
        backgroundColor: "#0e0e1a",
        backgroundImage: "linear-gradient(to bottom right, rgba(30, 30, 47, 0.8), rgba(20, 20, 33, 0.95))",
        border: "1px solid rgba(108, 75, 255, 0.3)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(108, 75, 255, 0.2)",
        transition: "all 0.3s ease",
        borderRadius: "0.75rem"
      }}
    >
      {/* Card Glows - hidden on small screens */}
      <div className="hidden sm:block absolute -bottom-10 -right-10 w-20 sm:w-40 h-20 sm:h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="hidden sm:block absolute -top-10 -left-10 w-20 sm:w-40 h-20 sm:h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Verified Badge */}
      {!article.isdraft && (
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20">
          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium bg-green-900/60 text-white border border-green-500/30">
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            <span className="hidden sm:inline">Verified Content</span>
            <span className="sm:hidden">Verified</span>
          </span>
        </div>
      )}

      <CardHeader className="p-3 sm:p-4 pb-0">
        <div className="overflow-hidden rounded-lg w-full mx-auto" style={{ maxHeight: "150px" }}>
          <AspectRatio ratio={16 / 10}>
            <div className="relative overflow-hidden" style={{ borderRadius: "0.5rem" }}>
              <img
                src={thumbnailUrl || imageUrl || ''}
                alt={article.title}
                className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                style={{ objectPosition: "center" }}
                onError={() => handleImageError(!!thumbnailUrl)}
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
            </div>
          </AspectRatio>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-5 pb-2 sm:pb-3">
        <h2 
          className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white leading-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {article.title}
        </h2>
        
        <p 
          className="line-clamp-2 sm:line-clamp-3 text-sm sm:text-base text-gray-400 mb-2 sm:mb-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {article.description}
        </p>
        
        {/* Author address */}
        <div className="flex items-center gap-1 sm:gap-1.5 mt-2 sm:mt-4">
          <span className="text-gray-400 text-xs sm:text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>By</span>
          <span 
            className="py-0.5 px-1.5 sm:px-2 rounded flex items-center gap-1 text-xs sm:text-sm"
            style={{ 
              color: "var(--color-secondary)",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500
            }}
          >
            {article.authoraddress ? `${article.authoraddress.slice(0, 6)}...${article.authoraddress.slice(-4)}` : 'Unknown'}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-5 pt-0 sm:pt-0 pb-2 sm:pb-3">
        <div className="text-xs sm:text-sm flex items-center justify-between w-full">
          <span></span>
          {showActions && (
            <div className="flex flex-wrap gap-1 sm:gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 hover:border-secondary/50 transition-colors duration-300"
                style={{ borderColor: "rgba(0, 209, 193, 0.3)", color: "var(--color-secondary)" }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onEdit?.(article);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="text-xs h-7"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDelete?.(article.id);
                }}
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                Delete
              </Button>
              <Button
                size="sm"
                className="web3-btn text-xs h-7"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onPublish?.(article);
                }}
              >
                Publish
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}