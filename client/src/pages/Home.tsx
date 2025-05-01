import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Brain, 
  Sparkles, 
  Zap, 
  Shield, 
  FileText, 
  Cpu, 
  Code, 
  Check, 
  Globe, 
  Lock, 
  LineChart,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export function Home() {
  const isMobile = useIsMobile();

  // Define animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen cyber-grid">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-10 pt-16 sm:pb-16 sm:pt-24">
        <div className="absolute inset-0 z-[-1]">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.7),transparent)]" />
          
          {/* Animated background elements */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 1.5 }}
            className="absolute top-1/3 right-1/3 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl"
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="absolute bottom-1/4 left-1/3 h-96 w-96 rounded-full bg-cyan-600/20 blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-block rounded-full bg-white/5 px-3 py-1 text-sm backdrop-blur"
              style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <span className="text-primary font-medium">
                Blockchain-Powered AI Content Platform
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 glow-text tracking-tight">
              The Future of Digital Content
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-12">
              AIGen combines blockchain verification with cutting-edge AI to create a revolutionary platform for trustworthy, high-quality digital content generation and consumption.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12">
              <Button 
                asChild
                size="lg" 
                className="flex items-center gap-2 text-base px-6 py-6" 
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 0 20px rgba(108, 75, 255, 0.4)'
                }}
              >
                <Link href="/articles">
                  <span>Explore Articles</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="flex items-center gap-2 text-base backdrop-blur-md px-6 py-6" 
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <Link href="/mission">
                  <span>Learn More</span>
                  <BookOpen className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Feature highlights */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-6"
          >
            {[
              { 
                icon: <Brain className="h-6 w-6 text-primary" />, 
                title: "AI-Powered", 
                description: "Advanced algorithms generate high-quality content tailored to specific topics" 
              },
              { 
                icon: <Shield className="h-6 w-6 text-cyan-400" />, 
                title: "Blockchain Verified", 
                description: "Every article is authenticated and secured on the blockchain" 
              },
              { 
                icon: <Sparkles className="h-6 w-6 text-fuchsia-400" />, 
                title: "Web3 Integration", 
                description: "Connect your wallet for a seamless decentralized experience" 
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="rounded-xl p-6 backdrop-blur-lg" 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 rounded-lg bg-white/5 mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About section with 3D cyberpunk style */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left column - Visualization */}
            <div className="relative">
              <div className="relative z-10">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="relative aspect-video overflow-hidden rounded-lg border border-primary/20"
                  style={{
                    background: 'linear-gradient(145deg, rgba(30, 30, 47, 0.8), rgba(30, 30, 47, 0.4))',
                    boxShadow: '0 0 30px rgba(108, 75, 255, 0.2)'
                  }}
                >
                  <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Cg fill=\'%236C4BFF\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M0 0h1v1H0V0zm3 0h1v1H3V0zm3 0h1v1H6V0zm3 0h1v1H9V0zm3 0h1v1h-1V0zm3 0h1v1h-1V0zm3 0h1v1h-1V0zM0 3h1v1H0V3zm3 0h1v1H3V3zm3 0h1v1H6V3zm3 0h1v1H9V3zm3 0h1v1h-1V3zm3 0h1v1h-1V3zm3 0h1v1h-1V3zM0 6h1v1H0V6zm3 0h1v1H3V6zm3 0h1v1H6V6zm3 0h1v1H9V6zm3 0h1v1h-1V6zm3 0h1v1h-1V6zm3 0h1v1h-1V6zM0 9h1v1H0V9zm3 0h1v1H3V9zm3 0h1v1H6V9zm3 0h1v1H9V9zm3 0h1v1h-1V9zm3 0h1v1h-1V9zm3 0h1v1h-1V9zM0 12h1v1H0v-1zm3 0h1v1H3v-1zm3 0h1v1H6v-1zm3 0h1v1H9v-1zm3 0h1v1h-1v-1zm3 0h1v1h-1v-1zm3 0h1v1h-1v-1zM0 15h1v1H0v-1zm3 0h1v1H3v-1zm3 0h1v1H6v-1zm3 0h1v1H9v-1zm3 0h1v1h-1v-1zm3 0h1v1h-1v-1zm3 0h1v1h-1v-1zM0 18h1v1H0v-1zm3 0h1v1H3v-1zm3 0h1v1H6v-1zm3 0h1v1H9v-1zm3 0h1v1h-1v-1zm3 0h1v1h-1v-1zm3 0h1v1h-1v-1z\'/%3E%3C/g%3E%3C/svg%3E")' }}>
                    <div className="glow-lines"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      animate={{ 
                        rotateY: [0, 360],
                      }}
                      transition={{ 
                        duration: 20, 
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="relative h-32 w-32 sm:h-40 sm:w-40"
                    >
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-cyan-500/30 blur-xl"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="h-16 w-16 sm:h-20 sm:w-20 text-primary" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="absolute -right-4 -bottom-4 rounded-lg border border-white/10 p-3 bg-background/90 backdrop-blur"
                  style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Cpu className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">AI Generation</p>
                      <p className="text-sm font-medium">Neural Processing</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="absolute -left-4 -top-4 rounded-lg border border-white/10 p-3 bg-background/90 backdrop-blur"
                  style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Security</p>
                      <p className="text-sm font-medium">Blockchain Verified</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right column - Text */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-block rounded-full bg-white/5 px-3 py-1 text-sm backdrop-blur mb-2">
                <span className="text-primary font-medium">About AIGen</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Revolutionizing Digital Content Creation
              </h2>
              <p className="text-muted-foreground mb-6">
                AIGen represents a paradigm shift in how we create, verify, and consume digital content. By combining 
                advanced AI algorithms with blockchain verification, we're building a platform that ensures content 
                authenticity while maintaining the highest quality standards.
              </p>
              
              <div className="space-y-4">
                {[
                  "Advanced neural networks generating human-quality content",
                  "Immutable blockchain verification of every published article",
                  "Web3 wallet integration for seamless creator authentication",
                  "Multi-format content support including text, audio, and visuals"
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-block rounded-full bg-white/5 px-3 py-1 text-sm backdrop-blur mb-2">
              <span className="text-cyan-400 font-medium">Platform Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              Cutting-Edge Technology Stack
            </h2>
            <p className="text-muted-foreground">
              Our platform combines multiple advanced technologies to create a seamless, 
              secure, and powerful content ecosystem for creators and consumers.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                icon: <Brain className="h-6 w-6 text-primary" />,
                title: "Advanced AI Content Generation",
                description: "Harness the power of cutting-edge language models to create high-quality articles on any topic."
              },
              {
                icon: <Shield className="h-6 w-6 text-cyan-400" />,
                title: "Blockchain Authentication",
                description: "Every piece of content is cryptographically secured and verified on the blockchain."
              },
              {
                icon: <FileText className="h-6 w-6 text-fuchsia-400" />,
                title: "Multi-Format Support",
                description: "Generate and consume content across multiple formats including text, audio, and visuals."
              },
              {
                icon: <Globe className="h-6 w-6 text-cyan-400" />,
                title: "Decentralized Publishing",
                description: "Publish directly to the blockchain, ensuring your content remains immutable and uncensorable."
              },
              {
                icon: <LineChart className="h-6 w-6 text-primary" />,
                title: "Analytics & Insights",
                description: "Gain valuable insights into content performance and reader engagement."
              },
              {
                icon: <Code className="h-6 w-6 text-fuchsia-400" />,
                title: "Open API Ecosystem",
                description: "Integrate with our platform using our comprehensive developer APIs and tools."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="rounded-xl p-6 backdrop-blur-lg feature-card" 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="space-y-4">
                  <div className="p-2 inline-block rounded-lg bg-white/5 mb-2">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div 
          className="absolute inset-0 z-[-1] overflow-hidden"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(108, 75, 255, 0.1))' }}
        >
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.7),transparent)]" />
        </div>
        
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="rounded-2xl mx-auto max-w-4xl overflow-hidden backdrop-blur-xl p-8 sm:p-12"
            style={{ 
              background: 'linear-gradient(145deg, rgba(30, 30, 47, 0.8), rgba(30, 30, 47, 0.4))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 40px rgba(108, 75, 255, 0.2)'
            }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Ready to Experience the Future?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Connect your wallet and join our platform to explore AI-generated content
                with blockchain verification and security.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Button 
                asChild
                size="lg" 
                className="flex items-center gap-2 text-base px-6 py-6 w-full sm:w-auto" 
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 0 20px rgba(108, 75, 255, 0.4)'
                }}
              >
                <Link href="/articles">
                  <span>Browse Articles</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="flex items-center gap-2 text-base px-6 py-6 w-full sm:w-auto" 
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <Link href="/mission">
                  <span>Learn More</span>
                  <BookOpen className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Custom styles are in global CSS */}
    </div>
  );
}