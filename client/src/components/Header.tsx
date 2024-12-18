import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { connectWallet } from "@/lib/web3";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateArticleForm } from "@/components/CreateArticleForm";

export function Header() {
  const [address, setAddress] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  // Track wallet connection and changes
  useEffect(() => {
    // Initial connection check
    if (window.ethereum?.selectedAddress) {
      setAddress(window.ethereum.selectedAddress);
    }

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts[0] || null);
      if (!accounts[0]) {
        toast({
          title: "Disconnected",
          description: "Wallet disconnected",
          variant: "destructive",
        });
      }
    };

    // Listen for network changes
    const handleNetworkChanged = () => {
      // Re-check connection on network change
      if (window.ethereum?.selectedAddress) {
        setAddress(window.ethereum.selectedAddress);
      } else {
        setAddress(null);
      }
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleNetworkChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleNetworkChanged);
    };
  }, [toast]);

  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      setAddress(addr);
      toast({
        title: "Connected",
        description: "Wallet connected successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold">
          <Link href="/">AIGen</Link>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/" className="text-foreground hover:text-primary">
            Articles
          </Link>
          <Link href="/mission" className="text-foreground hover:text-primary">
            Mission/Vision
          </Link>
          
          {address ? (
            <div className="flex items-center gap-4">
              <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                Create Article
              </Button>
              <Link href="/profile" className="text-foreground hover:text-primary">
                My Content
              </Link>
              <div className="text-sm text-muted-foreground">
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </div>
            </div>
          ) : (
            <Button onClick={handleConnect}>Login</Button>
          )}

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Article</DialogTitle>
              </DialogHeader>
              <CreateArticleForm address={address || ""} onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </nav>
      </div>
    </header>
  );
}
