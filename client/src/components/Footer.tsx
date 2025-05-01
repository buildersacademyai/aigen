import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Mail, Phone, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background mt-auto relative overflow-hidden">
      {/* Clean, minimal footer with the exact layout from the provided image */}
      <div className="container mx-auto px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4">
          {/* Left Column - Logo and Description */}
          <div className="space-y-3 flex flex-col items-center">
            <h2 className="text-xl font-bold text-primary">
              <Link href="/">AIGen</Link>
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              From Prompt to Proof—on the Blockchain.
            </p>
          </div>

          {/* Middle Column - Links */}
          <div className="flex flex-col items-center">
            <h3 className="font-semibold mb-4 text-primary">Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/mission" className="text-white/80 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Mission/Vision
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-white/80 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-white/80 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Articles
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Column - Contact */}
          <div className="flex flex-col items-center">
            <h3 className="font-semibold mb-4 text-primary">Contact</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <a href="https://buildersacademy.ai" className="text-white/80 hover:text-primary transition-colors">
                  buildersacademy.ai
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:contact@buildersacademy.ai" className="text-white/80 hover:text-primary transition-colors">
                  contact@buildersacademy.ai
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+9779869245461" className="text-white/80 hover:text-primary transition-colors">
                  +977 9869245461
                </a>
              </li>
            </ul>
            <Button 
              className="w-full rounded-full py-2"
              style={{
                backgroundColor: 'var(--color-primary)',
                border: 'none'
              }}
            >
              <a 
                href="https://discord.gg/HNhfAugqjb" 
                className="text-white flex items-center justify-center w-full"
              >
                Join Community
              </a>
            </Button>
          </div>
        </div>

        {/* Copyright section - centered and minimal */}
        <div className="mt-8 pt-4 border-t border-border/20 flex flex-col items-center justify-center  text-center">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} AIGen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}