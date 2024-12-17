import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { connectWallet } from "@/lib/web3";

export function Header() {
  const [address, setAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      setAddress(addr);
      toast({
        title: "Connected",
        description: "Wallet connected successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold">
          <Link href="/">BuildersAcademy</Link>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/articles" className="text-foreground hover:text-primary">
            Articles
          </Link>
          <Link href="/mission" className="text-foreground hover:text-primary">
            Mission/Vision
          </Link>
          
          {address ? (
            <div className="text-sm text-muted-foreground">
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </div>
          ) : (
            <Button onClick={handleConnect}>Login</Button>
          )}
        </nav>
      </div>
    </header>
  );
}
