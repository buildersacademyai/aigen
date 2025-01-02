import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Lock, Zap, Rocket, Target, Code2 } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Creation",
    description: "Leveraging cutting-edge AI to transform content creation and delivery"
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Blockchain Verification",
    description: "Ensuring content authenticity through decentralized verification"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Dynamic Content",
    description: "Multi-modal content generation with text, audio, and visual elements"
  }
];

const roadmap = [
  { year: "2024", milestone: "Launch of AI content generation" },
  { year: "2024", milestone: "Integration of blockchain verification" },
  { year: "2025", milestone: "Advanced audio synthesis features" },
  { year: "2025", milestone: "Creator marketplace implementation" }
];

export function Mission() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Revolutionizing Digital Content Creation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empowering creators with AI and blockchain technology to produce
            authentic, engaging, and innovative content
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div 
          className="mb-16"
          {...fadeIn}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6">
                To democratize content creation through the power of Web3 and AI,
                enabling creators to produce and share high-quality content while
                maintaining authenticity and ownership.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="p-4 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <div className="text-primary mb-2">{feature.icon}</div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vision Section */}
        <motion.div 
          className="mb-16"
          {...fadeIn}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  We envision a future where content creation is accessible to everyone,
                  powered by advanced AI technology and secured by blockchain verification,
                  creating a trustworthy and engaging platform for sharing knowledge and ideas.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-sm">AI-Powered</Badge>
                  <Badge variant="outline" className="text-sm">Blockchain Verified</Badge>
                  <Badge variant="outline" className="text-sm">Decentralized</Badge>
                  <Badge variant="outline" className="text-sm">Multi-Modal</Badge>
                  <Badge variant="outline" className="text-sm">Creator-Owned</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Roadmap Section */}
        <motion.div 
          {...fadeIn}
          className="mb-16"
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Platform Roadmap</h2>
              <div className="space-y-4">
                {roadmap.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <div className="min-w-[60px] text-primary font-semibold">
                      {item.year}
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors">
                      {item.milestone}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Technologies Section */}
        <motion.div 
          {...fadeIn}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Core Technologies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card/50 hover:bg-card/80 transition-colors">
                  <Code2 className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Advanced AI Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      State-of-the-art language models for content generation,
                      with multi-modal capabilities including text, audio, and visual content.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card/50 hover:bg-card/80 transition-colors">
                  <Target className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Blockchain Technology</h3>
                    <p className="text-sm text-muted-foreground">
                      Decentralized content verification and ownership management
                      through smart contracts and Web3 integration.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}