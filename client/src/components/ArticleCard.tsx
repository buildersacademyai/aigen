import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useLocation } from "wouter";

interface ArticleCardProps {
  article: {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    authorAddress: string;
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const [, setLocation] = useLocation();

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={() => setLocation(`/article/${article.id}`)}
    >
      <CardHeader className="p-0">
        <AspectRatio ratio={16 / 9}>
          <img
            src={article.imageUrl}
            alt={article.title}
            className="object-cover w-full h-full"
          />
        </AspectRatio>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-xl font-bold mb-2">{article.title}</h3>
        <p className="text-muted-foreground line-clamp-3">{article.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="text-sm text-muted-foreground">
          By {article.authorAddress.slice(0, 6)}...{article.authorAddress.slice(-4)}
        </div>
      </CardFooter>
    </Card>
  );
}
