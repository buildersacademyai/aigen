import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <AspectRatio ratio={16 / 9}>
          <Skeleton className="w-full h-full" />
        </AspectRatio>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}
