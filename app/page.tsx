"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleClick = (path: string) => {
    router.push(path);
  }

  const cards = [
    {
      id: "sale",
      title: "Sale Agreement",
      description: "Create and manage property sale agreements with file uploads",
      icon: "📄",
      path: "/Components/sale",
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
      shadowColor: "shadow-blue-500/25"
    },
    {
      id: "rent",
      title: "Rent Agreement",
      description: "Handle rental agreements with tenant management",
      icon: "🏠",
      path: "./Components/rent",
      gradient: "from-green-500 to-green-600",
      hoverGradient: "from-green-600 to-green-700",
      shadowColor: "shadow-green-500/25"
    },
    {
      id: "admin",
      title: "Admin Dashboard",
      description: "Manage all agreements, view reports, and send alerts",
      icon: "🔐",
      path: "/admin",
      gradient: "from-purple-500 to-purple-600",
      hoverGradient: "from-purple-600 to-purple-700",
      shadowColor: "shadow-purple-500/25"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
            Agreement Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Streamline your property agreements with our comprehensive digital solution.
            Create, manage, and track sale and rental agreements with automated notifications.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <div className="flex items-center text-sm text-gray-500 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              System Online
            </div>
            <div className="flex items-center text-sm text-gray-500 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-blue-500 mr-1">📱</span>
              SMS Alerts Active
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`group relative overflow-hidden rounded-2xl bg-white shadow-xl ${card.shadowColor} transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer`}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleClick(card.path)}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Content */}
              <div className="relative p-8 text-center">
                {/* Icon */}
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-4">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300 leading-relaxed">
                  {card.description}
                </p>

                {/* Hover Indicator */}
                <div className="mt-6 flex justify-center">
                  <div className={`w-12 h-1 rounded-full bg-gradient-to-r ${card.gradient} transform transition-all duration-300 ${
                    hoveredCard === card.id ? 'scale-x-150 opacity-100' : 'scale-x-0 opacity-0'
                  }`} />
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full blur-lg group-hover:blur-xl transition-all duration-500" />
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Why Choose Our System?</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-4">📋</div>
              <h3 className="font-semibold text-gray-900 mb-2">Digital Agreements</h3>
              <p className="text-gray-600 text-sm">Create and store agreements digitally</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="font-semibold text-gray-900 mb-2">SMS Alerts</h3>
              <p className="text-gray-600 text-sm">Automatic notifications for expiring agreements</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Access</h3>
              <p className="text-gray-600 text-sm">Protected admin dashboard with authentication</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">Track and manage all your agreements</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center text-gray-500">
          <p className="text-sm">
            © 2025 Agreement Management System. Built with Next.js and Twilio.
          </p>
        </div>
      </div>
    </div>
  );
}
