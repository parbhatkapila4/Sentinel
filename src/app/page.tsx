import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { SignInButtonWrapper } from "@/components/sign-in-button";

export default async function Home() {
  const user = await currentUser();

    return (
    <div className="min-h-screen bg-black text-white antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button className="px-4 py-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                <span className="text-black font-semibold text-sm">Revenue Sentinel</span>
              </button>
              <div className="hidden md:flex items-center gap-6">
                <Link href="#features" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link href="#blog" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                  Blog
                </Link>
                <Link href="#faq" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                  FAQ
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                Login
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  Get started
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <div className="px-5 py-2.5 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 cursor-pointer">
            <SignInButtonWrapper />
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
      </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Curved yellow orbital lines */}
          <svg className="absolute top-32 right-32 w-[500px] h-[500px] opacity-40" viewBox="0 0 500 500" fill="none">
            <path d="M 50 250 Q 250 50 450 250 T 50 250" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M 100 250 Q 250 100 400 250 T 100 250" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.5" />
          </svg>
          
          {/* Glossy colored spheres */}
          <div className="absolute top-48 left-24 w-40 h-40 bg-red-500 rounded-full opacity-25 blur-2xl"></div>
          <div className="absolute top-64 left-48 w-32 h-32 bg-yellow-400 rounded-full opacity-25 blur-2xl"></div>
          <div className="absolute bottom-48 right-48 w-48 h-48 bg-blue-500 rounded-full opacity-25 blur-2xl"></div>
          
          {/* Blue chevron stack on right */}
          <div className="absolute right-24 top-1/2 -translate-y-1/2 flex flex-col gap-3 opacity-30">
            {Array.from({ length: 7 }).map((_, i) => (
              <svg key={i} className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1]">
                Never Lose a Deal to
                <br />
                <span className="text-blue-400">Silent Decay.</span>
          </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl">
                Real-time risk detection that tells you exactly which deals are dying—and what to do about it. 
                See why the most innovative sales teams add automated risk alerts, deal-specific action recommendations 
                and intelligent activity tracking on top of conventional CRM systems. You won&apos;t go back.
              </p>
              
              {/* CTA Section */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl pt-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    Open Dashboard
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <div className="px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer">
                    <SignInButtonWrapper />
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Right: 3D Illustration with Chat Bubbles */}
            <div className="relative lg:min-h-[600px]">
              {/* Abstract 3D Illustration Container */}
              <div className="relative w-full h-full">
                {/* 3D Pipes, Tracks, and Structures */}
                <svg viewBox="0 0 500 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    {/* Glossy gradients for 3D effect */}
                    <linearGradient id="blueGloss" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#1e40af" stopOpacity="0.7" />
                    </linearGradient>
                    <linearGradient id="orangeGloss" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fb923c" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity="0.7" />
                    </linearGradient>
                    <linearGradient id="yellowGloss" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fcd34d" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
                    </linearGradient>
                    <radialGradient id="sphereBlue" cx="50%" cy="30%">
                      <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#1e40af" stopOpacity="0.6" />
                    </radialGradient>
                    <radialGradient id="sphereOrange" cx="50%" cy="30%">
                      <stop offset="0%" stopColor="#fdba74" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity="0.6" />
                    </radialGradient>
                    <radialGradient id="sphereYellow" cx="50%" cy="30%">
                      <stop offset="0%" stopColor="#fde047" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
                    </radialGradient>
                    <radialGradient id="sphereRed" cx="50%" cy="30%">
                      <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity="0.6" />
                    </radialGradient>
                  </defs>

                  {/* Complex network of blue pipes */}
                  <path d="M 50 100 Q 150 40 250 100 T 450 100" stroke="url(#blueGloss)" strokeWidth="12" fill="none" opacity="0.8" />
                  <path d="M 80 180 Q 200 120 320 180 T 480 180" stroke="url(#blueGloss)" strokeWidth="10" fill="none" opacity="0.75" />
                  <path d="M 100 260 Q 220 200 340 260" stroke="url(#blueGloss)" strokeWidth="9" fill="none" opacity="0.7" />
                  <path d="M 120 340 Q 240 280 360 340" stroke="url(#blueGloss)" strokeWidth="8" fill="none" opacity="0.65" />
                  
                  {/* Orange tracks intersecting */}
                  <path d="M 70 140 L 430 200" stroke="url(#orangeGloss)" strokeWidth="10" fill="none" opacity="0.8" />
                  <path d="M 90 220 L 410 280" stroke="url(#orangeGloss)" strokeWidth="9" fill="none" opacity="0.75" />
                  <path d="M 110 300 Q 250 240 390 300" stroke="url(#orangeGloss)" strokeWidth="8" fill="none" opacity="0.7" />
                  <path d="M 130 380 Q 270 320 410 380" stroke="url(#orangeGloss)" strokeWidth="7" fill="none" opacity="0.65" />
                  
                  {/* Yellow connecting tracks */}
                  <path d="M 60 160 Q 180 100 300 160" stroke="url(#yellowGloss)" strokeWidth="8" fill="none" opacity="0.75" />
                  <path d="M 140 240 L 360 300" stroke="url(#yellowGloss)" strokeWidth="7" fill="none" opacity="0.7" />
                  <path d="M 160 320 Q 280 260 400 320" stroke="url(#yellowGloss)" strokeWidth="6" fill="none" opacity="0.65" />
                  
                  {/* Prominent gear structure in upper center */}
                  <g transform="translate(250, 200)">
                    {/* Outer gear ring */}
                    <circle r="45" fill="none" stroke="url(#blueGloss)" strokeWidth="5" opacity="0.7" />
                    <circle r="35" fill="none" stroke="url(#blueGloss)" strokeWidth="4" opacity="0.75" />
                    <circle r="25" fill="url(#blueGloss)" opacity="0.6" />
                    {/* Gear teeth */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const angle = (i * 45) * Math.PI / 180;
                      const x1 = Math.cos(angle) * 40;
                      const y1 = Math.sin(angle) * 40;
                      const x2 = Math.cos(angle) * 50;
                      const y2 = Math.sin(angle) * 50;
                      return (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#blueGloss)" strokeWidth="4" opacity="0.7" />
                      );
                    })}
                  </g>
                  
                  {/* Secondary gear structure */}
                  <g transform="translate(150, 350)">
                    <circle r="35" fill="none" stroke="url(#orangeGloss)" strokeWidth="4" opacity="0.7" />
                    <circle r="25" fill="none" stroke="url(#orangeGloss)" strokeWidth="3" opacity="0.75" />
                    <circle r="18" fill="url(#orangeGloss)" opacity="0.6" />
                    {Array.from({ length: 6 }).map((_, i) => {
                      const angle = (i * 60) * Math.PI / 180;
                      const x1 = Math.cos(angle) * 30;
                      const y1 = Math.sin(angle) * 30;
                      const x2 = Math.cos(angle) * 38;
                      const y2 = Math.sin(angle) * 38;
                      return (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#orangeGloss)" strokeWidth="3" opacity="0.7" />
                      );
                    })}
                  </g>
                  
                  {/* Glossy spheres embedded in tracks */}
                  <circle cx="120" cy="100" r="30" fill="url(#sphereBlue)" opacity="0.9" />
                  <circle cx="280" cy="100" r="28" fill="url(#sphereBlue)" opacity="0.85" />
                  <circle cx="380" cy="180" r="32" fill="url(#sphereBlue)" opacity="0.9" />
                  
                  <circle cx="150" cy="200" r="25" fill="url(#sphereOrange)" opacity="0.9" />
                  <circle cx="320" cy="260" r="30" fill="url(#sphereOrange)" opacity="0.85" />
                  <circle cx="400" cy="300" r="28" fill="url(#sphereOrange)" opacity="0.9" />
                  
                  <circle cx="180" cy="160" r="22" fill="url(#sphereYellow)" opacity="0.9" />
                  <circle cx="340" cy="240" r="24" fill="url(#sphereYellow)" opacity="0.85" />
                  <circle cx="250" cy="320" r="26" fill="url(#sphereYellow)" opacity="0.9" />
                  
                  {/* Red sphere */}
                  <circle cx="200" cy="280" r="28" fill="url(#sphereRed)" opacity="0.9" />
                  
                  {/* Additional connecting pipes for complexity */}
                  <path d="M 180 120 L 220 180" stroke="url(#blueGloss)" strokeWidth="6" fill="none" opacity="0.6" />
                  <path d="M 300 140 L 340 200" stroke="url(#orangeGloss)" strokeWidth="6" fill="none" opacity="0.6" />
                  <path d="M 240 220 L 280 280" stroke="url(#yellowGloss)" strokeWidth="5" fill="none" opacity="0.6" />
                  <path d="M 160 300 L 200 360" stroke="url(#blueGloss)" strokeWidth="5" fill="none" opacity="0.6" />
                  
                  {/* More intersecting tracks */}
                  <path d="M 100 180 Q 200 140 300 180" stroke="url(#yellowGloss)" strokeWidth="6" fill="none" opacity="0.65" />
                  <path d="M 200 240 L 300 300" stroke="url(#blueGloss)" strokeWidth="6" fill="none" opacity="0.6" />
                </svg>

                {/* Chat Bubbles Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Bubble 1 - Top Left (Purple) */}
                  <div className="absolute top-24 left-12 bg-purple-500 rounded-2xl rounded-bl-none p-4 max-w-[220px] shadow-2xl">
                    <p className="text-white text-sm font-medium leading-snug">Deal at risk: No activity in 7 days</p>
                  </div>
                  
                  {/* Bubble 2 - Top Right (Blue) */}
                  <div className="absolute top-40 right-20 bg-blue-500 rounded-2xl rounded-br-none p-4 max-w-[180px] shadow-2xl">
                    <p className="text-white text-sm font-medium leading-snug">Send follow-up email</p>
                  </div>
                  
                  {/* Bubble 3 - Middle Left (Purple) */}
                  <div className="absolute top-56 left-10 bg-purple-500 rounded-2xl rounded-bl-none p-4 max-w-[240px] shadow-2xl">
                    <p className="text-white text-sm font-medium leading-snug">Negotiation stalled without response</p>
                  </div>
                  
                  {/* Bubble 4 - Middle Right (Blue) */}
                  <div className="absolute top-72 right-16 bg-blue-500 rounded-2xl rounded-br-none p-4 max-w-[200px] shadow-2xl">
                    <p className="text-white text-sm font-medium leading-snug">Nudge for response</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial and Partner Logos Section */}
      <section className="py-16 px-6 lg:px-8 bg-gray-900/60 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Testimonial */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full shrink-0 flex items-center justify-center">
                <span className="text-white/60 text-xs">RS</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white mb-1">&quot;Game Changer&quot;</p>
                <p className="text-white/60 text-sm">Sales Leader, Enterprise Team</p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
              <div className="text-white/80 font-semibold text-sm">Real-Time Alerts</div>
              <div className="text-white/80 font-semibold text-sm">Action Recommendations</div>
              <div className="text-white/80 font-semibold text-sm">Risk Detection</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - "Still Using Big SMS?" style */}
      <section id="features" className="py-32 px-6 lg:px-8 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm text-blue-400 mb-4 uppercase tracking-wider font-semibold">Features</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Still Using Basic CRMs? You&apos;re Missing Out
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Everything You Need. Everything You Didn&apos;t Know You Needed.
            </p>
          </div>

          {/* Floating Feature Cards */}
          <div className="relative">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 - Real-time Alerts */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  Real-time risk alerts tell you exactly which deals need attention—before it&apos;s too late.
                </p>
              </div>

              {/* Card 2 - Action Recommendations */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  Intelligent action recommendations tell you what to do next—no guessing, no missed opportunities.
                </p>
              </div>

              {/* Card 3 - Activity Tracking */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  Automated activity tracking detects silence and inactivity—so you never lose a deal to decay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - "Text to Buy Means More Money" style */}
      <section id="pricing" className="py-32 px-6 lg:px-8 bg-gray-900/30 relative overflow-hidden">
        {/* Background visualization */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
            <svg viewBox="0 0 400 400" className="w-full h-full opacity-20">
              <circle cx="200" cy="200" r="150" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
              <circle cx="200" cy="200" r="100" fill="none" stroke="#f97316" strokeWidth="2" opacity="0.3" />
              <circle cx="200" cy="200" r="50" fill="#fbbf24" opacity="0.2" />
              <circle cx="120" cy="120" r="30" fill="#3b82f6" opacity="0.3" />
              <circle cx="280" cy="280" r="30" fill="#f97316" opacity="0.3" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm text-blue-400 mb-4 uppercase tracking-wider font-semibold">Why Revenue Sentinel</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Real-Time Risk Detection Means More Deals Closed
            </h2>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Stat Card 1 */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 relative hover:bg-white/10 transition-all">
              <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full"></div>
              <div className="text-6xl font-bold text-white mb-4">0</div>
              <p className="text-white/70 text-lg leading-relaxed">
                Deals lost to silent decay when you catch risk early
              </p>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 relative hover:bg-white/10 transition-all">
              <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="text-6xl font-bold text-white mb-4">24/7</div>
              <p className="text-white/70 text-lg leading-relaxed">
                Continuous monitoring of deal health and activity status
              </p>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 relative hover:bg-white/10 transition-all">
              <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="text-6xl font-bold text-white mb-4">100%</div>
              <p className="text-white/70 text-lg leading-relaxed">
                Actionable recommendations for every at-risk deal
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-16">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors"
              >
                Open Dashboard
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors cursor-pointer">
                <SignInButtonWrapper />
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-blue-400 mb-4 uppercase tracking-wider font-semibold">How It Works</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Action-First Deal Management
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              See exactly which deals need attention and what to do about them—before it&apos;s too late
            </p>
          </div>

          {/* Process Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-blue-500/20 backdrop-blur-xl rounded-2xl p-12 border border-blue-500/30">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Track Deal Activity</h3>
                    <p className="text-white/80">Monitor emails, meetings, calls, and notes in real-time</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Detect Risk Automatically</h3>
                    <p className="text-white/80">Get instant alerts when deals show signs of stalling or inactivity</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Take Action</h3>
                    <p className="text-white/80">Follow recommended actions to save deals and close more revenue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-32 px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Getting Started is Easy and Fast
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            See why the most innovative revenue teams choose Revenue Sentinel for deal risk detection.
          </p>
          {user ? (
          <Link
            href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors"
          >
              Open Dashboard
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
          </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors cursor-pointer">
              <SignInButtonWrapper />
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <button className="px-4 py-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
              <span className="text-black font-semibold text-sm">Revenue Sentinel</span>
            </button>
            <div className="flex gap-8 text-white/60 text-sm">
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="#blog" className="hover:text-white transition-colors">Blog</Link>
              <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
