import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Lock, Zap, Rocket, Target, Code2, Sparkles } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Creation",
    description: "Transform your ideas into engaging content with our advanced AI technology"
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Blockchain Verification",
    description: "Secure your content with decentralized verification and ownership"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Dynamic Content",
    description: "Create rich multimedia experiences with text, audio, and visuals"
  }
];

const roadmap = [
  { year: "2024", milestone: "Launch of AI content generation platform" },
  { year: "2024", milestone: "Web3 integration and content verification" },
  { year: "2025", milestone: "Advanced audio synthesis and processing" },
  { year: "2025", milestone: "Decentralized creator marketplace" }
];

export function Mission() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
            Revolutionizing Digital Content
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Empowering creators with cutting-edge AI and blockchain technology to produce
            authentic, engaging, and innovative content for the future
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div 
          className="mb-16"
          {...fadeIn}
        >
          <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-card/50 to-card">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Our Mission</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                To revolutionize content creation through the synergy of Web3 and AI,
                enabling creators to produce and share exceptional content while
                maintaining complete authenticity and ownership.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="p-6 rounded-lg bg-gradient-to-br from-card/50 via-card/30 to-card/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border border-primary/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <div className="text-primary mb-3">{feature.icon}</div>
                    <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
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
          <Card className="border-primary/10 bg-gradient-to-br from-card/50 to-card">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Our Vision</h2>
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  We envision a future where content creation knows no bounds,
                  where creators can harness the power of advanced AI while maintaining
                  their unique voice, all secured and verified through blockchain technology.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-primary/20 hover:border-primary/40 transition-colors">AI-Powered</Badge>
                  <Badge variant="outline" className="border-primary/20 hover:border-primary/40 transition-colors">Blockchain Verified</Badge>
                  <Badge variant="outline" className="border-primary/20 hover:border-primary/40 transition-colors">Decentralized</Badge>
                  <Badge variant="outline" className="border-primary/20 hover:border-primary/40 transition-colors">Multi-Modal</Badge>
                  <Badge variant="outline" className="border-primary/20 hover:border-primary/40 transition-colors">Creator-Owned</Badge>
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
          <Card className="border-primary/10 bg-gradient-to-br from-card/50 to-card">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Platform Roadmap</h2>
              <div className="space-y-4">
                {roadmap.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="min-w-[80px] text-primary font-semibold">
                      {item.year}
                    </div>
                    <div className="flex-1 p-4 rounded-lg bg-gradient-to-r from-card/50 via-card/30 to-card/50 border border-primary/10">
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
          <Card className="border-primary/10 bg-gradient-to-br from-card/50 to-card">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Core Technologies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  className="flex items-start gap-4 p-6 rounded-lg bg-gradient-to-br from-card/50 via-card/30 to-card/50 border border-primary/10"
                  whileHover={{ scale: 1.02 }}
                >
                  <Code2 className="w-8 h-8 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">Advanced AI Integration</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Utilizing state-of-the-art language models and neural networks
                      to generate high-quality content across multiple formats including
                      text, audio, and visual media.
                    </p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start gap-4 p-6 rounded-lg bg-gradient-to-br from-card/50 via-card/30 to-card/50 border border-primary/10"
                  whileHover={{ scale: 1.02 }}
                >
                  <Target className="w-8 h-8 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">Blockchain Technology</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Implementing robust decentralized systems for content verification,
                      ownership management, and creator rewards through smart contracts
                      and Web3 integration.
                    </p>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}