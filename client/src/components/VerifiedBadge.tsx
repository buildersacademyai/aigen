import { motion } from "framer-motion";
import { ShieldCheck, Verified } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
}

export function VerifiedBadge({ className }: VerifiedBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-primary/30 rounded-full",
        "bg-gradient-to-r from-primary/30 to-background backdrop-blur-md neon-border",
        className
      )}
    >
      <motion.div
        initial={{ rotate: -180 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative"
      >
        <ShieldCheck className="w-4 h-4 text-primary" />
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-50"
          animate={{ 
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          <ShieldCheck className="w-4 h-4 text-white" />
        </motion.div>
      </motion.div>
      <span className="text-white text-xs font-semibold tracking-wider">BLOCKCHAIN VERIFIED</span>
    </motion.div>
  );
}
