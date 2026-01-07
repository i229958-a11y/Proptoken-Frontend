import { motion } from 'framer-motion';
import { Target, Users, Shield, Mail, Send, Award, TrendingUp, Building2, Sparkles, Star, Globe, Lock, CheckCircle, Zap, Heart, Rocket } from 'lucide-react';
import { useState } from 'react';

const About = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setContactForm({ name: '', email: '', message: '' });
  };

  const teamMembers = [
    {
      name: 'Moosa Saeed',
      role: 'CEO & Founder',
      image: 'https://ui-avatars.com/api/?name=Moosa+Saeed&background=FF7A00&color=fff&size=200&bold=true',
    },
    {
      name: 'Sohail Nasir',
      role: 'CEO & Founder',
      image: 'https://ui-avatars.com/api/?name=Sohail+Nasir&background=FF7A00&color=fff&size=200&bold=true',
    },
    {
      name: 'Ayesha Jawad',
      role: 'Co-Founder',
      image: 'https://ui-avatars.com/api/?name=Ayesha+Jawad&background=FF7A00&color=fff&size=200&bold=true',
    },
    {
      name: 'Manal Ahsan',
      role: 'Co-Founder',
      image: 'https://ui-avatars.com/api/?name=Manal+Ahsan&background=FF7A00&color=fff&size=200&bold=true',
    },
  ];

  const roadmapItems = [
    { quarter: 'Q1 2025', items: ['Platform Launch', 'First Property Tokenization', '1000+ Users'] },
    { quarter: 'Q2 2025', items: ['Mobile App Release', 'International Expansion', '10+ Properties'] },
    { quarter: 'Q3 2025', items: ['Secondary Market', 'Staking Rewards', '50+ Properties'] },
    { quarter: 'Q4 2025', items: ['Global Expansion', '100+ Properties', '1M+ Users'] },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-orange-50/30">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary/10 via-white to-primary/5 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 180, 360],
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
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6"
            >
              <Sparkles size={16} />
              <span>About PropToken</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-primary via-orange-500 to-pink-600 animate-gradient bg-[length:200%_auto]">
                About
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-pink-500 via-orange-500 to-primary animate-gradient bg-[length:200%_auto] mt-2">
                PropToken
              </span>
            </motion.h1>
            <p className="text-2xl md:text-3xl text-accent-600 max-w-3xl mx-auto leading-relaxed">
              Democratizing real estate investment through blockchain technology
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission & Vision */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative bg-gradient-to-br from-white to-primary/5 rounded-3xl shadow-2xl p-10 border-2 border-primary/10 overflow-hidden group"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary-600 to-primary rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-gradient-to-br from-primary to-primary-600 p-4 rounded-3xl shadow-lg">
                    <Target className="text-white" size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-accent-900">Our Mission</h2>
                </div>
                <p className="text-lg text-accent-700 leading-relaxed">
                  To make real estate investment accessible to everyone by tokenizing premium properties
                  and enabling fractional ownership. We believe that everyone should have the opportunity
                  to invest in real estate, regardless of their financial capacity.
                </p>
                <div className="mt-6 flex items-center space-x-2 text-primary">
                  <Heart className="fill-primary" size={20} />
                  <span className="font-semibold">Empowering Investors</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative bg-gradient-to-br from-white to-primary/5 rounded-3xl shadow-2xl p-10 border-2 border-primary/10 overflow-hidden group"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary-600 to-primary rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-gradient-to-br from-primary to-primary-600 p-4 rounded-3xl shadow-lg">
                    <Rocket className="text-white" size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-accent-900">Our Vision</h2>
                </div>
                <p className="text-lg text-accent-700 leading-relaxed">
                  To become the leading platform for real estate tokenization globally, creating a
                  transparent, secure, and efficient marketplace where investors can easily discover,
                  invest in, and manage tokenized real estate assets.
                </p>
                <div className="mt-6 flex items-center space-x-2 text-primary">
                  <Globe className="text-primary" size={20} />
                  <span className="font-semibold">Global Leadership</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Platform Purpose */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-primary/10 via-white to-primary/5 rounded-3xl shadow-2xl p-12 md:p-16 border-2 border-primary/20 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, #FF7A00 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6"
                >
                  <Zap size={16} />
                  <span>Platform Purpose</span>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-bold text-accent-900 mb-6">Why PropToken?</h2>
              </div>
              <p className="text-xl md:text-2xl text-accent-700 leading-relaxed text-center max-w-4xl mx-auto mb-12">
                PropToken revolutionizes real estate investment by leveraging blockchain technology to
                tokenize properties. Our platform enables fractional ownership, making it possible for
                investors to own a portion of premium real estate with minimal capital. Through smart
                contracts, we ensure transparency, security, and automated distribution of rental income
                and capital gains to token holders.
              </p>
              
              {/* Key Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {[
                  { icon: Building2, title: 'Fractional Ownership', desc: 'Own a piece of premium real estate' },
                  { icon: Lock, title: 'Blockchain Security', desc: 'Transparent and secure transactions' },
                  { icon: TrendingUp, title: 'Passive Income', desc: 'Earn rental income automatically' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft-lg border border-white/50 text-center"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-600 text-white rounded-2xl mb-4 shadow-lg">
                      <feature.icon size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-accent-900 mb-2">{feature.title}</h3>
                    <p className="text-accent-600">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Team */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6"
            >
              <Users size={16} />
              <span>Our Team</span>
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-bold text-accent-900 mb-6">Meet Our Founders</h2>
            <p className="text-xl md:text-2xl text-accent-600 max-w-2xl mx-auto">
              The visionary leaders building the future of real estate tokenization
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="relative group h-full"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-primary via-primary-600 to-primary rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-white to-primary/5 rounded-3xl shadow-2xl p-8 text-center border-2 border-primary/10 overflow-hidden h-full flex flex-col">
                  <div className="relative mb-6 flex-shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-600 rounded-3xl opacity-20 blur"></div>
                    <img
                      src={member.image}
                      alt={member.name}
                      className="relative w-40 h-40 rounded-3xl mx-auto object-cover border-4 border-white shadow-2xl"
                    />
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg flex items-center justify-center space-x-1 whitespace-nowrap">
                      <Star className="fill-white text-white" size={14} />
                      <span>{member.role.includes('Founder') ? 'Founder' : member.role}</span>
                    </div>
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-accent-900 mb-3 min-h-[3rem] flex items-center justify-center">{member.name}</h3>
                    <p className="text-lg text-primary font-bold mb-4 min-h-[1.75rem] flex items-center justify-center">{member.role}</p>
                    <div className="mt-4 min-h-[2rem] flex items-center justify-center">
                      {member.role.includes('CEO') && (
                        <div className="inline-flex items-center space-x-1 px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                          <Award size={14} />
                          <span>Leadership</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Security & Audits */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-white via-primary/5 to-white rounded-3xl shadow-2xl p-12 md:p-16 border-2 border-primary/20 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, #FF7A00 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
                <div className="bg-gradient-to-br from-primary to-primary-600 p-6 rounded-3xl shadow-2xl">
                  <Shield className="text-white" size={48} />
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl md:text-5xl font-bold text-accent-900 mb-4">Security & Audits</h2>
                  <p className="text-xl text-accent-700 leading-relaxed">
                    Security is our top priority. All smart contracts undergo rigorous security audits
                    by leading blockchain security firms.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Multi-signature wallet protection',
                  'Regular security audits and penetration testing',
                  'KYC/AML compliance',
                  'Encrypted data storage',
                  'Two-factor authentication for admin access',
                  'Regular backup and disaster recovery procedures',
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-soft border border-white/50"
                  >
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                    <span className="text-accent-700 font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Roadmap */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6"
            >
              <Rocket size={16} />
              <span>Our Journey</span>
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-bold text-accent-900 mb-6">Roadmap</h2>
            <p className="text-xl md:text-2xl text-accent-600 max-w-2xl mx-auto">
              Our strategic plan for the future of real estate tokenization
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmapItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="relative group flex"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary-600 to-primary rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-white to-primary/5 rounded-3xl shadow-2xl p-8 border-2 border-primary/10 w-full flex flex-col h-full">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {index + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-primary">{item.quarter}</h3>
                  </div>
                  <ul className="space-y-3 flex-grow">
                    {item.items.map((roadmapItem, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 + i * 0.1 }}
                        className="text-accent-700 flex items-start"
                      >
                        <CheckCircle className="text-primary flex-shrink-0 mr-2 mt-0.5" size={18} />
                        <span className="font-medium">{roadmapItem}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-white via-primary/5 to-white rounded-3xl shadow-2xl p-12 md:p-16 border-2 border-primary/20 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, #FF7A00 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6"
                >
                  <Mail size={16} />
                  <span>Get In Touch</span>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-bold text-accent-900 mb-4">Contact Us</h2>
                <p className="text-xl text-accent-600 max-w-2xl mx-auto">
                  Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-bold text-accent-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-6 py-4 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-accent-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-6 py-4 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-accent-700 mb-2">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    rows={6}
                    placeholder="Tell us how we can help you..."
                    className="w-full px-6 py-4 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-lg"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-center space-x-3 px-8 py-5 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-bold text-lg shadow-2xl transition-all"
                >
                  <Send size={24} />
                  <span>Send Message</span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default About;

