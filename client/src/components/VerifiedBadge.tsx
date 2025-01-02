import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
}

export function VerifiedBadge({ className }: VerifiedBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full",
        className
      )}
    >
      <motion.div
        initial={{ rotate: -180 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <CheckCircle className="w-4 h-4 text-green-500" />
      </motion.div>
      <span>Verified Content</span>
    </motion.div>
  );
}
