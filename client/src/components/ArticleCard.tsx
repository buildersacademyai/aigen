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
  const [thumbnailUrl, setThumbnailUrl] = useState(article.thumbnailurl);
  const [imageError, setImageError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  useEffect(() => {
    // Reset state when article changes
    setImageUrl(article.imageurl);
    setThumbnailUrl(article.thumbnailurl);
    setImageError(false);
    setThumbnailError(false);
  }, [article]);

  // Function to verify and potentially recover image
  const verifyImage = async (url: string, isThumbnail: boolean) => {
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
      if (article.thumbnailurl) {
        verifyImage(article.thumbnailurl, true);
      }
    } else {
      setImageError(true);
      verifyImage(article.imageurl, false);
    }
  };

  return (
    <Card 
      className="overflow-hidden relative neon-border bg-background/40 backdrop-blur-sm"
      onClick={() => !showActions && setLocation(`/article/${article.id}`)}
    >
      {/* Verified Badge */}
      {!article.isdraft && (
        <div className="absolute top-2 right-2 z-10">
          <VerifiedBadge className="!bg-background/95 shadow-md backdrop-blur-sm" />
        </div>
      )}

      <CardHeader className="p-0">
        <AspectRatio ratio={16 / 9}>
          <img
            src={thumbnailUrl || imageUrl}
            alt={article.title}
            className="object-cover w-full h-full rounded-t-md"
            onError={() => handleImageError(!!thumbnailUrl)}
          />
        </AspectRatio>
      </CardHeader>
      <CardContent className="p-5">
        <h3 className="text-xl font-bold mb-3 text-white/90">{article.title}</h3>
        <p className="text-muted-foreground line-clamp-3 text-white/70">{article.description}</p>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <div className="text-sm text-muted-foreground flex items-center justify-between w-full">
          <span className="bg-primary/10 py-1 px-2 rounded-md border border-primary/20">
            {article.authoraddress ? `${article.authoraddress.slice(0, 6)}...${article.authoraddress.slice(-4)}` : 'Unknown'}
          </span>
          {showActions && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="hover:border-primary/50 hover:text-primary"
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