import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { SelectArticle } from "@db/schema";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ArticleCardProps {
  article: SelectArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="overflow-hidden">
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
