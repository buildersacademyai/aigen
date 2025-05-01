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
      className="overflow-hidden relative card-3d backdrop-blur-sm surface cursor-pointer"
      onClick={() => !showActions && setLocation(`/article/${article.id}`)}
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid rgba(108, 75, 255, 0.3)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(108, 75, 255, 0.2)",
        transition: "all 0.3s ease",
        borderRadius: "0.75rem"
      }}
    >
      {/* Card Glows */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Verified Badge */}
      {!article.isdraft && (
        <div className="absolute top-3 right-3 z-20">
          <VerifiedBadge />
        </div>
      )}

      <CardHeader className="p-0">
        <AspectRatio ratio={16 / 10}>
          <div className="relative overflow-hidden rounded-t-xl">
            <img
              src={thumbnailUrl || imageUrl || ''}
              alt={article.title}
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
              onError={() => handleImageError(!!thumbnailUrl)}
            />
            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          </div>
        </AspectRatio>
      </CardHeader>
      <CardContent className="p-5 pt-4">
        <h3 
          className="text-xl font-bold mb-2 text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {article.title}
        </h3>
        
        {/* Author address */}
        <div className="mb-3 flex items-center gap-1.5">
          <span 
            className="py-1 px-2 rounded-md flex items-center gap-1 text-sm"
            style={{ 
              backgroundColor: "rgba(0, 209, 193, 0.1)",
              border: "1px solid rgba(0, 209, 193, 0.2)"
            }}
          >
            <span 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--color-secondary)" }}
            ></span>
            <span style={{ color: "var(--color-secondary)", fontFamily: "'Inter', sans-serif" }}>
              {article.authoraddress ? `${article.authoraddress.slice(0, 6)}...${article.authoraddress.slice(-4)}` : 'Unknown'}
            </span>
          </span>
        </div>
        
        <p 
          className="line-clamp-2 text-white/70"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {article.description}
        </p>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <div className="text-sm flex items-center justify-between w-full">
          {/* Empty span to keep the space - we moved the address above */}
          <span></span>
          {showActions && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="hover:border-secondary/50 transition-colors duration-300"
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
                className="web3-btn"
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