import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';

const AnalyticsHeader = () => {
  return (
    <section className="relative py-12 bg-gradient-to-br from-primary/10 via-white to-primary/5 overflow-hidden rounded-3xl mb-12">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
          className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-primary-600 rounded-full blur-3xl"
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6"
          >
            <Sparkles size={16} />
            <span>AI-Powered Intelligence</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
          >
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-primary via-orange-500 to-pink-600 animate-gradient bg-[length:200%_auto]">
              ML Analytics
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-pink-500 via-orange-500 to-primary animate-gradient bg-[length:200%_auto] mt-2">
              Dashboard
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-accent-600 font-medium"
          >
            AI-powered insights for properties & users
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default AnalyticsHeader;

