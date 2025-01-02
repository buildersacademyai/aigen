import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useLocation } from "wouter";
import { useState } from "react";
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
  const [imageError, setImageError] = useState(false);

  // Function to verify and potentially recover image
  const verifyImage = async () => {
    if (!imageError) return;

    try {
      // Extract filename from imageUrl
      const filename = imageUrl.split('/').pop();
      if (!filename) return;

      const response = await fetch(`/api/images/verify/${filename}`);
      if (!response.ok) {
        throw new Error('Failed to verify image');
      }

      const data = await response.json();
      if (data.path) {
        // Add timestamp to bypass cache
        setImageUrl(`${data.path}?t=${Date.now()}`);
        setImageError(false);
      }
    } catch (error) {
      console.error('Error verifying image:', error);
    }
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
    verifyImage();
  };

  return (
    <Card 
      className="overflow-hidden transition-transform hover:scale-[1.02] relative"
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
            src={imageUrl}
            alt={article.title}
            className="object-cover w-full h-full"
            onError={handleImageError}
          />
        </AspectRatio>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-xl font-bold mb-2">{article.title}</h3>
        <p className="text-muted-foreground line-clamp-3">{article.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="text-sm text-muted-foreground flex items-center justify-between w-full">
          <span>By {article.authoraddress ? `${article.authoraddress.slice(0, 6)}...${article.authoraddress.slice(-4)}` : 'Unknown'}</span>
          {showActions && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
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
                variant="default"
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