import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { connectWallet } from "@/lib/web3";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateArticleForm } from "@/components/CreateArticleForm";
import { 
  Brain, 
  Braces, 
  File, 
  Box, 
  Wallet, 
  Plus, 
  User2, 
  LogOut,
  Settings,
  ChevronDown,
  UserCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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
    <header 
      className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10" 
      style={{ 
        background: 'linear-gradient(90deg, rgba(74, 46, 191, 0.4) 0%, rgba(101, 71, 255, 0.4) 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="container mx-auto px-4 py-2 flex items-center">
        {/* Left: Logo */}
        <div className="flex-shrink-0 mr-8">
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
        </div>
        
        {/* Middle: Navigation Links */}
        <div className="flex justify-center mx-auto">
          <div className="flex items-center gap-6">
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
          </div>
        </div>
        
        {/* Right: Action Buttons */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
          {address ? (
            <>
              <Button 
                onClick={() => setIsCreateOpen(true)} 
                className="flex items-center gap-1.5 transition-colors rounded-md"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-accent) 0%, #c026d3 100%)',
                  fontFamily: "'Inter', sans-serif",
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 0 15px rgba(217, 70, 239, 0.3)'
                }}
              >
                <div className="flex items-center justify-center h-5 w-5 bg-white/10 rounded">
                  <Plus className="w-3 h-3" />
                </div>
                <span>Create</span>
              </Button>
              
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="group flex items-center gap-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div 
                      className="flex-shrink-0 relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        boxShadow: '0 0 10px rgba(0, 209, 193, 0.5)'
                      }}
                    >
                      <UserCircle className="w-7 h-7 text-white" />
                      <div 
                        className="absolute inset-0 rounded-full" 
                        style={{ 
                          background: 'linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.3) 45%, transparent 50%)',
                          backgroundSize: '200% 200%',
                          animation: 'shimmer 3s infinite linear'
                        }}
                      />
                    </div>

                    <div className="flex flex-col items-start">
                      <div className="text-xs text-white/80" style={{ fontFamily: "'Inter', sans-serif" }}>Connected Wallet</div>
                      <div className="text-sm text-white flex items-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {`${address.slice(0, 6)}...${address.slice(-4)}`}
                        <ChevronDown className="ml-1 w-3 h-3 text-white/70 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent
                  className="w-64 border rounded-lg backdrop-blur-xl animate-in fade-in-80"
                  style={{ 
                    backgroundColor: 'rgba(30, 30, 47, 0.95)',
                    borderColor: 'rgba(108, 75, 255, 0.3)',
                    boxShadow: '0 0 20px rgba(108, 75, 255, 0.2)'
                  }}
                >
                  <div className="p-3 space-y-1">
                    <h3 
                      className="font-medium text-sm"
                      style={{ 
                        fontFamily: "'Space Grotesk', sans-serif",
                        color: 'white'
                      }}
                    >
                      Your Wallet
                    </h3>
                    <div 
                      className="text-xs py-1 px-2 rounded-md" 
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      {address}
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
                  
                  <Link href="/profile">
                    <DropdownMenuItem 
                      className="flex items-center gap-2 p-2 cursor-pointer hover:bg-white/10"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <div className="flex items-center justify-center w-6 h-6 bg-white/10 rounded-full text-white">
                        <User2 className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white">My Content</span>
                    </DropdownMenuItem>
                  </Link>
                  
                  <DropdownMenuItem 
                    className="flex items-center gap-2 p-2 cursor-pointer hover:bg-white/10"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <div className="flex items-center justify-center w-6 h-6 bg-white/10 rounded-full text-white">
                      <Settings className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white">Settings</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
                  
                  <DropdownMenuItem 
                    className="flex items-center gap-2 p-2 cursor-pointer hover:bg-red-900/20"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    onClick={() => {
                      setAddress(null);
                      setChainId(null);
                      localStorage.removeItem('lastAddress');
                      localStorage.removeItem('lastChainId');
                      window.location.href = '/';
                    }}
                  >
                    <div className="flex items-center justify-center w-6 h-6 bg-red-500/20 rounded-full text-red-400">
                      <LogOut className="w-3 h-3" />
                    </div>
                    <span className="text-red-400">Disconnect</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={handleConnect} 
              className="flex items-center gap-1.5 transition-colors rounded-md"
              style={{ 
                background: 'linear-gradient(135deg, var(--color-accent) 0%, #c026d3 100%)',
                fontFamily: "'Inter', sans-serif",
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 0 15px rgba(217, 70, 239, 0.3)'
              }}
            >
              <div className="flex items-center justify-center h-5 w-5 bg-white/10 rounded">
                <Wallet className="w-3 h-3" />
              </div>
              <span>Connect Wallet</span>
            </Button>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent 
          className="sm:max-w-md border rounded-lg backdrop-blur-xl"
          style={{ 
            backgroundColor: 'rgba(30, 30, 47, 0.95)',
            borderColor: 'rgba(217, 70, 239, 0.3)',
            boxShadow: '0 0 30px rgba(217, 70, 239, 0.2)'
          }}
        >
          <DialogHeader className="pb-4 border-b border-white/10">
            <DialogTitle className="flex items-center gap-2">
              <div className="relative flex items-center justify-center bg-white/10 h-8 w-8 rounded">
                <Braces className="w-4 h-4 text-fuchsia-400" />
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center" 
                  animate={{ 
                    opacity: [0.7, 0.2, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  <Braces className="w-4 h-4 text-fuchsia-400" />
                </motion.div>
              </div>
              <span 
                style={{ 
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}
              >
                Create New Article
              </span>
            </DialogTitle>
            <p 
              style={{
                fontFamily: "'Inter', sans-serif",
                color: 'rgba(255, 255, 255, 0.7)',
                marginTop: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              Generate an AI article by entering a topic below
            </p>
          </DialogHeader>
          <CreateArticleForm address={address || ""} onSuccess={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
}