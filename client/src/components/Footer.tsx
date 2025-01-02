import { Button } from "@/components/ui/button";
import { Link } from "wouter";
//
export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-2xl font-bold">
              <Link href="/">AIGen</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/mission" className="text-foreground hover:text-primary">
                  Mission/Vision
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-foreground hover:text-primary">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <p className="text-muted-foreground mb-4">
              Get in touch with us for any questions or concerns.
            </p>
            <Button className="w-full"><a href="https://discord.gg/HNhfAugqjb" >Join Community</a></Button>
          </div>
        </div>
      </div>
    </footer>
  );
}