import { ArticleCard } from "@/components/ArticleCard";
import { CreateArticleForm } from "@/components/CreateArticleForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const dummyArticles = [
  {
    id: 1,
    title: "The Future of Web3 Development",
    description: "Exploring how Web3 technologies are reshaping the development landscape and creating new opportunities for builders.",
    imageUrl: "https://picsum.photos/seed/web3/800/600",
    authorAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  },
  {
    id: 2,
    title: "Understanding Blockchain Technology",
    description: "A comprehensive guide to blockchain technology and its potential applications in various industries.",
    imageUrl: "https://picsum.photos/seed/blockchain/800/600",
    authorAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  },
  {
    id: 3,
    title: "AI Integration in Web3 Projects",
    description: "How artificial intelligence is being integrated into Web3 projects to create more powerful and intelligent applications.",
    imageUrl: "https://picsum.photos/seed/ai/800/600",
    authorAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  }
];

export function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = Boolean(window.ethereum?.selectedAddress);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Latest Articles</h1>
        {isLoggedIn && (
          <Button onClick={() => setIsOpen(true)}>Create Article</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
          </DialogHeader>
          <CreateArticleForm address={window.ethereum?.selectedAddress || "0x0"} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
