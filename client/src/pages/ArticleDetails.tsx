import { SocialShare } from "@/components/SocialShare";
import { Card, CardContent } from "@/components/ui/card";

interface ArticleProps {
  params: { id: string };
}

export function ArticleDetails({ params }: ArticleProps) {
  const dummyArticles = [
    {
      id: 1,
      title: "The Future of Web3 Development",
      content: `Web3 technologies are reshaping the development landscape and creating new opportunities for builders. This comprehensive exploration delves into the latest trends, tools, and methodologies that are defining the future of decentralized applications.

      Key aspects covered:
      - Blockchain integration
      - Smart contract development
      - Decentralized storage solutions
      - Web3 authentication methods
      
      As we move forward, the integration of these technologies continues to evolve, offering more robust and secure solutions for the next generation of web applications.`,
      description: "Exploring how Web3 technologies are reshaping the development landscape and creating new opportunities for builders.",
      imageUrl: "https://picsum.photos/seed/web3/800/600",
      authorAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    },
    {
      id: 2,
      title: "Understanding Blockchain Technology",
      content: `A comprehensive guide to blockchain technology and its potential applications in various industries. Discover how distributed ledger technology is transforming business processes and creating new opportunities for innovation.

      Topics covered:
      - Blockchain fundamentals
      - Consensus mechanisms
      - Smart contracts
      - Industry applications`,
      description: "A comprehensive guide to blockchain technology and its potential applications in various industries.",
      imageUrl: "https://picsum.photos/seed/blockchain/800/600",
      authorAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    },
    {
      id: 3,
      title: "AI Integration in Web3 Projects",
      content: `How artificial intelligence is being integrated into Web3 projects to create more powerful and intelligent applications. Learn about the synergies between AI and blockchain technology.

      Key topics:
      - AI in smart contracts
      - Machine learning on blockchain
      - Decentralized AI
      - Future possibilities`,
      description: "How artificial intelligence is being integrated into Web3 projects to create more powerful and intelligent applications.",
      imageUrl: "https://picsum.photos/seed/ai/800/600",
      authorAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    }
  ];

  const article = dummyArticles.find(a => a.id === parseInt(params.id));

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Article not found</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mx-auto">
        <CardContent className="p-6">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          <div className="text-sm text-muted-foreground mb-6">
            By {article.authorAddress.slice(0, 6)}...{article.authorAddress.slice(-4)}
          </div>
          <div className="prose prose-invert max-w-none mb-8">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph.trim()}
              </p>
            ))}
          </div>
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Share this article</h3>
            <SocialShare
              url={window.location.href}
              title={article.title}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
