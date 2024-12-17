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
