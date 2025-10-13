"use client";

import Link from "next/link"; // 1. Import the Next.js Link component
import {
  TrendingUp,
  Calculator,
  BarChart3,
  Shield,
  Zap,
  Play,
  Star,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-time NAV Tracking",
      description: "Track Net Asset Values with live updates and historical data visualization",
    },
    {
      icon: <Calculator className="w-8 h-8" />,
      title: "SIP Calculator",
      description: "Calculate returns on your systematic investment plans with precision",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Performance Analytics",
      description: "Comprehensive analysis of fund performance across different time periods",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Bank-grade security with 99.9% uptime for your financial data",
    },
  ];

  const stats = [
    { number: "2500+", label: "Mutual Funds" },
    { number: "50K+", label: "Active Users" },
    { number: "₹100Cr+", label: "Assets Tracked" },
    { number: "99.9%", label: "Uptime" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MutualTracker
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* 2. Changed 'About' button to a Next.js Link */}
              <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                About
              </Link>
              
              {/* 3. Wrapped 'View Funds' button contents in a Next.js Link */}
              <Link
                href="/funds" // Assuming your funds page is at /funds
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                View Funds
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Floating elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-32 w-12 h-12 bg-green-200 rounded-full opacity-20 animate-pulse delay-2000"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Now tracking 2500+ mutual funds
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Smart Mutual Fund
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                  Tracking Platform
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Track NAVs, analyze performance, and calculate SIP returns with our comprehensive 
                mutual fund platform. Make informed investment decisions.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                {/* 4. Wrapped 'Explore Funds' button in a Next.js Link */}
                <Link
                  href="/funds" // Navigate to /funds
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group"
                >
                  Explore Funds
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* 'Watch Demo' can remain a button if it opens a modal, but added a placeholder action */}
                <button
                  onClick={() => alert('Demo video coming soon!')}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-3xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (No functional changes needed here) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to track mutual funds
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools and insights to help you make better investment decisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to start tracking your investments?
          </h2>

          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of investors who trust MutualTracker for their mutual fund analysis
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* 5. Wrapped 'Get Started Free' button in a Next.js Link */}
            <Link
              href="/signup" // Placeholder for a signup/onboarding page
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center gap-2 text-sm opacity-90">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 bg-white/20 rounded-full border-2 border-white"></div>
                ))}
              </div>
              <span>Trusted by 50,000+ investors</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 mt-8">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
            <span className="ml-2 opacity-90">4.9/5 from 2,500+ reviews</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg">MutualTracker</span>
              </div>
              <p className="text-gray-400">
                The smart way to track and analyze mutual fund investments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                {/* 6. Changed Footer <a> tags to Next.js Link components */}
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MutualTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}