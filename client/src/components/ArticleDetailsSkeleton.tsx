import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function ArticleDetailsSkeleton() {
  return (
    <Card className="mx-auto overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Title and author section */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>

          {/* Audio player placeholder */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-12 w-full rounded-md" />
          </div>

          {/* Main image */}
          <Skeleton className="w-full h-64 rounded-lg" />

          {/* Article content */}
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Skeleton className="h-4 w-full" />
                <div className="h-2" /> {/* Spacing */}
                <Skeleton className="h-4 w-11/12" />
                <div className="h-2" />
                <Skeleton className="h-4 w-4/5" />
              </motion.div>
            ))}
          </div>

          {/* Share section */}
          <div className="border-t pt-6 mt-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
