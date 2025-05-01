import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Mail, Phone, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background/50 backdrop-blur-md mt-auto relative overflow-hidden">
      {/* Background grid overlay for cyberpunk effect */}
      <div className="absolute inset-0 cyber-grid opacity-5"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="text-2xl font-bold glow-text">
              <Link href="/" className="hover:opacity-80 transition-opacity">AIGen</Link>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              A cutting-edge decentralized media platform combining blockchain technology with AI-powered content generation.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-primary">Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/mission" className="text-foreground hover:text-primary transition-colors flex items-center gap-2 web3-link">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Mission/Vision
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-foreground hover:text-primary transition-colors flex items-center gap-2 web3-link">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-foreground hover:text-primary transition-colors flex items-center gap-2 web3-link">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Articles
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-primary">Contact</h3>
            <ul className="space-y-3 mb-4">
              <li className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-cyan-400" />
                <a href="https://buildersacademy.ai" className="hover:text-primary transition-colors">
                  buildersacademy.ai
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-cyan-400" />
                <a href="mailto:contact@buildersacademy.ai" className="hover:text-primary transition-colors">
                  contact@buildersacademy.ai
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-cyan-400" />
                <a href="tel:+9779869245461" className="hover:text-primary transition-colors">
                  +977 9869245461
                </a>
              </li>
            </ul>
            <Button 
              className="w-full relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, rgba(108, 75, 255, 0.8) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 0 10px rgba(108, 75, 255, 0.3)'
              }}
            >
              <a 
                href="https://discord.gg/HNhfAugqjb" 
                className="text-white relative z-10 flex items-center justify-center w-full"
              >
                Join Community
              </a>
              <div 
                className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                style={{ opacity: 0.2 }}
              ></div>
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AIGen. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-2 sm:mt-0">
            Developed by <a href="https://buildersacademy.ai" className="text-primary hover:underline">buildersacademy.ai</a>
          </p>
        </div>
      </div>
    </footer>
  );
}