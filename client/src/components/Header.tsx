import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { connectWallet } from "@/lib/web3";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateArticleForm } from "@/components/CreateArticleForm";
import { Brain, Braces, File, Box, Wallet, Plus, User2 } from "lucide-react";
import { motion } from "framer-motion";

const LOGO_3D = () => (
  <div className="relative flex items-center">
    <Box 
      className="w-8 h-8 mr-2 float-element" 
      style={{ 
        color: 'var(--color-secondary)',
        filter: 'drop-shadow(0 0 10px rgba(0, 209, 193, 0.5))'
      }} 
    />
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-2xl font-bold tracking-wider"
      style={{ 
        fontFamily: "'Space Grotesk', sans-serif",
        background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 15px rgba(108, 75, 255, 0.5)'
      }}
    >
      AIGen
    </motion.div>
  </div>
);

export function Header() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  // Track wallet connection and changes
  useEffect(() => {
    // Initial connection check
    const checkInitialConnection = async () => {
      if (window.ethereum?.selectedAddress) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
          const lastAddress = localStorage.getItem('lastAddress');
          const lastChainId = localStorage.getItem('lastChainId');

          if (accounts[0]) {
            if (accounts[0] !== lastAddress || currentChainId !== lastChainId) {
              console.log('Initial connection: Address or chain changed');
              setAddress(accounts[0]);
              setChainId(currentChainId);
              localStorage.setItem('lastAddress', accounts[0]);
              localStorage.setItem('lastChainId', currentChainId);
            } else {
              setAddress(lastAddress);
              setChainId(lastChainId);
            }
          } else if (lastAddress) {
            console.log('Initial connection: No accounts found, clearing stored data');
            handleDisconnect();
          }
        } catch (error) {
          console.error('Failed to get initial account:', error);
          handleDisconnect();
        }
      }
    };

    const handleDisconnect = () => {
      setAddress(null);
      setChainId(null);
      localStorage.removeItem('lastAddress');
      localStorage.removeItem('lastChainId');
      window.location.href = '/';
      toast({
        title: "Wallet Disconnected",
        description: "Please reconnect your wallet",
        variant: "destructive",
      });
    };

    // Listen for account changes
    const handleAccountsChanged = async (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      const newAddress = accounts[0] || null;
      const lastAddress = localStorage.getItem('lastAddress');

      if (!newAddress) {
        console.log('No new address found, disconnecting');
        handleDisconnect();
        return;
      }

      if (lastAddress && newAddress !== lastAddress) {
        console.log('Address changed, disconnecting');
        handleDisconnect();
      } else if (newAddress) {
        setAddress(newAddress);
        localStorage.setItem('lastAddress', newAddress);
      }
    };

    // Listen for network changes
    const handleChainChanged = async (newChainId: string) => {
      console.log('Chain changed:', newChainId);
      const lastChainId = localStorage.getItem('lastChainId');

      if (lastChainId && newChainId !== lastChainId) {
        console.log('Chain ID changed, disconnecting');
        handleDisconnect();
      } else if (newChainId) {
        setChainId(newChainId);
        localStorage.setItem('lastChainId', newChainId);
      }
    };

    // Check for disconnection or changes
    const checkConnection = async () => {
      if (!window.ethereum) {
        console.log('No ethereum provider found');
        handleDisconnect();
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        const lastAddress = localStorage.getItem('lastAddress');
        const lastChainId = localStorage.getItem('lastChainId');

        if (!accounts[0] || !currentChainId) {
          console.log('No accounts or chain ID found during check');
          if (lastAddress || lastChainId) {
            handleDisconnect();
          }
          return;
        }

        if (accounts[0] !== lastAddress || currentChainId !== lastChainId) {
          console.log('Address or chain changed during check');
          handleDisconnect();
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        handleDisconnect();
      }
    };

    checkInitialConnection();

    const interval = setInterval(checkConnection, 5000);

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
      clearInterval(interval);
    };
  }, [toast]);

  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

      setAddress(addr);
      setChainId(currentChainId);
      localStorage.setItem('lastAddress', addr);
      localStorage.setItem('lastChainId', currentChainId);

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
    <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10" 
      style={{ 
        background: 'linear-gradient(90deg, rgba(74, 46, 191, 0.4) 0%, rgba(101, 71, 255, 0.4) 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className="relative w-8 h-8 bg-white/10 rounded text-white flex items-center justify-center mr-2">
            <Box className="h-5 w-5 text-white" />
          </div>
          <span 
            className="text-white text-xl font-bold tracking-wide"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            AIGen
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1.5 text-white hover:text-white/80 transition-colors">
            <div className="flex items-center justify-center w-5 h-5 bg-white/10 rounded text-white">
              <File className="w-3 h-3 text-white" />
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif" }}>Articles</span>
          </Link>
          <Link href="/mission" className="flex items-center gap-1.5 text-white hover:text-white/80 transition-colors">
            <div className="flex items-center justify-center w-5 h-5 bg-white/10 rounded text-white">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif" }}>Mission</span>
          </Link>

          {address ? (
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setIsCreateOpen(true)} 
                className="flex items-center gap-1.5 transition-colors rounded-md"
                style={{ 
                  backgroundColor: 'var(--color-accent)',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                <div className="flex items-center justify-center h-5 w-5 bg-white/10 rounded">
                  <Plus className="w-3 h-3" />
                </div>
                <span>Create</span>
              </Button>
              <Link 
                href="/profile" 
                className="flex items-center gap-1.5 text-white hover:text-white/80 transition-colors"
              >
                <div className="flex items-center justify-center w-5 h-5 bg-white/10 rounded text-white">
                  <User2 className="w-3 h-3 text-white" />
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif" }}>My Content</span>
              </Link>
              <div className="text-sm py-1.5 px-3 rounded-md flex items-center text-white"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </div>
            </div>
          ) : (
            <Button onClick={handleConnect} 
              className="flex items-center gap-1.5 transition-colors rounded-md"
              style={{ 
                backgroundColor: 'var(--color-accent)',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <div className="flex items-center justify-center h-5 w-5 bg-white/10 rounded">
                <Wallet className="w-3 h-3" />
              </div>
              <span>Connect Wallet</span>
            </Button>
          )}

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent 
              className="neon-border sm:max-w-md"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="relative float-element">
                    <Braces 
                      className="w-5 h-5" 
                      style={{ color: 'var(--color-secondary)' }}
                    />
                    <motion.div 
                      className="absolute inset-0" 
                      animate={{ 
                        opacity: [0.5, 0.2, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                    >
                      <Braces className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
                    </motion.div>
                  </div>
                  <span 
                    style={{ 
                      fontFamily: "'Space Grotesk', sans-serif",
                      background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Create New Article
                  </span>
                </DialogTitle>
              </DialogHeader>
              <CreateArticleForm address={address || ""} onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </nav>
      </div>
    </header>
  );
}