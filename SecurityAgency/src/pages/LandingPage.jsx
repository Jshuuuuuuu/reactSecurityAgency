import { API_URL } from ../config/api;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Users, Clock, CheckCircle, Phone, Mail, MapPin, Menu, X, Lock, Zap, Award } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    {
      icon: Shield,
      title: "Armed Security Guards",
      description: "Highly trained professionals providing maximum protection for your premises and personnel."
    },
    {
      icon: Eye,
      title: "24/7 Surveillance",
      description: "Advanced monitoring systems with round-the-clock coverage to ensure constant vigilance."
    },
    {
      icon: Users,
      title: "Event Security",
      description: "Specialized security teams for corporate events, concerts, and private gatherings."
    },
    {
      icon: Lock,
      title: "Access Control",
      description: "Sophisticated entry systems and protocols to manage and secure your facilities."
    },
    {
      icon: Zap,
      title: "Rapid Response",
      description: "Emergency response teams ready to deploy within minutes of any incident."
    },
    {
      icon: Award,
      title: "Risk Assessment",
      description: "Comprehensive security audits and customized protection strategies."
    }
  ];

  const stats = [
    { number: "15+", label: "Years Experience" },
    { number: "500+", label: "Clients Protected" },
    { number: "24/7", label: "Support Available" },
    { number: "98%", label: "Client Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">RQA Security Agency</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="hover:text-blue-400 transition-colors">Home</a>
              <a href="#services" className="hover:text-blue-400 transition-colors">Services</a>
              <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
              <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>
            </div>

            <div className="hidden md:flex space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
              >
                Admin Login
              </button>
              <button className="border-2 border-blue-500 hover:bg-blue-500/10 px-6 py-2 rounded-lg transition-colors">
                Get Quote
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800">
            <div className="px-4 py-4 space-y-3">
              <a href="#home" className="block hover:text-blue-400 transition-colors">Home</a>
              <a href="#services" className="block hover:text-blue-400 transition-colors">Services</a>
              <a href="#about" className="block hover:text-blue-400 transition-colors">About</a>
              <a href="#contact" className="block hover:text-blue-400 transition-colors">Contact</a>
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
              >
                Admin Login
              </button>
              <button className="w-full border-2 border-blue-500 hover:bg-blue-500/10 px-6 py-2 rounded-lg transition-colors">
                Get Quote
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-950 to-slate-950"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg1OSwgMTMwLCAyNDYsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent animate-fade-in">
              Premium Security Solutions
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8">
              Protecting what matters most with professional security services tailored to your needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105">
                Request Consultation
              </button>
              <button className="border-2 border-blue-500 hover:bg-blue-500/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                Learn More
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">{stat.number}</div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-slate-400">Comprehensive security solutions for every need</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all hover:transform hover:scale-105 group">
                  <div className="bg-blue-600/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600/20 transition-colors">
                    <Icon className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
                  <p className="text-slate-400">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose RQA?</h2>
              <p className="text-xl text-slate-400 mb-8">
                With over 15 years of experience, we've established ourselves as the leading security provider in the region.
              </p>
              
              <div className="space-y-4">
                {[
                  "Licensed and certified security professionals",
                  "State-of-the-art surveillance technology",
                  "Customized security solutions",
                  "24/7 emergency response team",
                  "Proven track record of excellence"
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                    <span className="text-lg text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-xl">
                <Clock className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-2">24/7</h3>
                <p className="text-blue-100">Round-the-clock protection</p>
              </div>
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-8 rounded-xl">
                <Users className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Expert</h3>
                <p className="text-slate-300">Trained professionals</p>
              </div>
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-8 rounded-xl">
                <Shield className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Secure</h3>
                <p className="text-slate-300">Maximum protection</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-xl">
                <Zap className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Fast</h3>
                <p className="text-blue-100">Rapid response time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h2>
            <p className="text-xl text-slate-400">Ready to secure your future? Contact us today</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-8 rounded-xl text-center border border-slate-700 hover:border-blue-500 transition-colors">
              <Phone className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-slate-400">+1 (555) 123-4567</p>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-xl text-center border border-slate-700 hover:border-blue-500 transition-colors">
              <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-slate-400">info@rqasecurityagency.com</p>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-xl text-center border border-slate-700 hover:border-blue-500 transition-colors">
              <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-slate-400">123 Security Ave, Suite 100</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold">RQA Security Agency</span>
          </div>
          <p className="text-slate-400 mb-4">Professional Security Solutions Since 2009</p>
          <p className="text-slate-500 text-sm">© 2024 RQA Security Agency. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

