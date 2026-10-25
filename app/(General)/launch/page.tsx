"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, 
  Sparkles, Zap, ShieldCheck, Truck, CreditCard, ArrowRight, 
  Copy, Check, Share2, Flame, Smartphone, Laptop, Radio, Award
} from "lucide-react";
import { toast } from "sonner";

interface Scene {
  id: number;
  duration: number; // in seconds
  title: string;
  tagline: string;
}

const SCENES: Scene[] = [
  { id: 0, duration: 8, title: "The Awakening", tagline: "A New Era of Tech in Ghana" },
  { id: 1, duration: 10, title: "The Hardware", tagline: "Premium Smartphones & Workstations" },
  { id: 2, duration: 10, title: "The Revolution", tagline: "Falaa Deals & Pay Small Small" },
  { id: 3, duration: 10, title: "Grand Launch", tagline: "We Are Officially Live!" },
];

const TOTAL_DURATION = SCENES.reduce((acc, s) => acc + s.duration, 0); // 38s

export default function LaunchAdPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine current active scene based on currentTime
  const getCurrentSceneIndex = useCallback((time: number) => {
    let accumulated = 0;
    for (let i = 0; i < SCENES.length; i++) {
      accumulated += SCENES[i].duration;
      if (time < accumulated) return i;
    }
    return SCENES.length - 1;
  }, []);

  const currentScene = getCurrentSceneIndex(currentTime);

  // Play synthesized audio effects using Web Audio API
  const playSoundEffect = useCallback((type: 'boom' | 'whoosh' | 'synth' | 'fanfare') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === 'boom') {
        // Deep sub-bass boom
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.9);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.9);
      } else if (type === 'whoosh') {
        // High-tech frequency sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'synth') {
        // Upbeat cyberpunk chords
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.08, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.45);
        });
      } else if (type === 'fanfare') {
        // Celebratory triumphant major chord progression
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.2);
        });
      }
    } catch (e) {
      console.warn("Audio Context init error", e);
    }
  }, [isMuted]);

  // Audio trigger on scene transitions
  const prevSceneRef = useRef(currentScene);
  useEffect(() => {
    if (prevSceneRef.current !== currentScene) {
      if (currentScene === 0) playSoundEffect('boom');
      if (currentScene === 1) playSoundEffect('whoosh');
      if (currentScene === 2) playSoundEffect('synth');
      if (currentScene === 3) playSoundEffect('fanfare');
      prevSceneRef.current = currentScene;
    }
  }, [currentScene, playSoundEffect]);

  // Particle & Confetti Canvas animation for Scene 3
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    const colors = ['#ea580c', '#f97316', '#38bdf8', '#fbbf24', '#ffffff', '#a855f7'];

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    resize();
    window.addEventListener('resize', resize);

    // Populate particles
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 4,
        speedY: Math.random() * 3 + 1.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (currentScene === 3) {
        particles.forEach((p) => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();

          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += p.rotationSpeed;

          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentScene]);

  // Main playback timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= TOTAL_DURATION) {
            setIsPlaying(false);
            return TOTAL_DURATION;
          }
          return Number((prev + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
    playSoundEffect('boom');
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const jumpToScene = (index: number) => {
    let targetTime = 0;
    for (let i = 0; i < index; i++) {
      targetTime += SCENES[i].duration;
    }
    setCurrentTime(targetTime);
    setIsPlaying(true);
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen error", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText("LAUNCH10");
    setCopiedCode(true);
    toast.success("Coupon code LAUNCH10 copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white pt-4 pb-16 px-4 md:px-8 selection:bg-orange-500 selection:text-white">
      {/* Background Cyber Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-orange-600/15 via-blue-600/15 to-transparent blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        
        {/* Top Header Badge */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-500/30 text-orange-400 text-xs md:text-sm font-bold uppercase tracking-widest backdrop-blur-md shadow-lg shadow-orange-500/10">
            <Sparkles size={14} className="animate-spin text-orange-400" />
            Official Launch Commercial
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-orange-400">
            TEQVAULT IS OFFICIALLY LIVE
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
            Experience the grand unveiling of Ghana&apos;s ultimate tech plug. Premium smartphones, killer workstations, Falaa Deals, and flexible financing.
          </p>
        </div>

        {/* Cinematic Video Player Container */}
        <div 
          ref={videoContainerRef}
          className="relative w-full aspect-[16/9] bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-[0_0_60px_rgba(234,88,12,0.15)] group"
        >
          {/* Confetti & Particle Canvas Overlay */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 pointer-events-none z-30" 
          />

          {/* Sound Notification Alert for user if muted */}
          {isMuted && isPlaying && (
            <button
              onClick={() => {
                setIsMuted(false);
                playSoundEffect('boom');
              }}
              className="absolute top-5 left-5 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-600/90 hover:bg-orange-600 text-white text-xs font-bold backdrop-blur-md transition-all shadow-lg shadow-orange-600/30 cursor-pointer animate-pulse"
            >
              <VolumeX size={15} />
              Tap to Enable Sound
            </button>
          )}

          {/* Top Branding Watermark */}
          <div className="absolute top-5 right-5 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold tracking-wider text-slate-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            TEQVAULT COMMERCIAL 4K
          </div>

          {/* SCENE CONTENTS */}
          <AnimatePresence mode="wait">

            {/* SCENE 0: The Teaser / Awakening */}
            {currentScene === 0 && (
              <motion.div
                key="scene-0"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, filter: "blur(8px)" }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-radial from-slate-900/90 via-[#0a0d14] to-black"
              >
                {/* Background Tech Visual Glow */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-transparent" />

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="space-y-4 max-w-2xl relative z-10"
                >
                  <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-orange-400">
                    Are you ready for the revolution?
                  </p>
                  
                  <h2 className="text-3xl md:text-6xl font-black tracking-tight text-white uppercase leading-none">
                    Tired of Overpriced <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                      Fake Tech Plugs?
                    </span>
                  </h2>

                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="text-base md:text-2xl font-bold text-slate-300"
                  >
                    Ghana, meet your new tech destination.
                  </motion.p>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 3.5, type: "spring", stiffness: 120 }}
                    className="pt-4"
                  >
                    <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 shadow-2xl shadow-orange-500/40">
                      <div className="px-8 py-3 bg-black rounded-xl text-2xl md:text-4xl font-extrabold tracking-widest text-white">
                        TEQVAULT
                      </div>
                    </div>
                    <p className="mt-2 text-xs md:text-sm text-slate-400 tracking-wider uppercase font-semibold">
                      Your Trusted Plug for Quality Gadgets
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* SCENE 1: The Hardware Lineup */}
            {currentScene === 1 && (
              <motion.div
                key="scene-1"
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col justify-between p-6 md:p-12 bg-gradient-to-b from-[#0b101b] via-[#080b12] to-black"
              >
                {/* Background Image of commercial launch hero */}
                <div className="absolute inset-0 opacity-45 mix-blend-screen pointer-events-none">
                  <Image 
                    src="/launch_ad_hero.jpg" 
                    alt="TEQVAULT Launch Gear" 
                    fill 
                    className="object-cover object-center"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                {/* Top Headline */}
                <div className="relative z-10 text-left space-y-1">
                  <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-widest">
                    <Award size={16} /> 100% Genuine Guaranteed
                  </div>
                  <h2 className="text-2xl md:text-5xl font-black text-white tracking-tight">
                    FLAGSHIP GEAR. <span className="text-orange-400">UNMATCHED PRICES.</span>
                  </h2>
                </div>

                {/* Product Showcase Cards in 3D Grid */}
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 my-auto">
                  {[
                    { name: "iPhones & Galaxies", icon: Smartphone, desc: "Flagship 5G Series", tag: "Hot Seller" },
                    { name: "Workstations & Macs", icon: Laptop, desc: "M3 & Gaming Rigs", tag: "Heavy Duty" },
                    { name: "Starlink & Routers", icon: Radio, desc: "High-Speed Satellites", tag: "In Stock" },
                    { name: "Audio & Accessories", icon: Zap, desc: "Studio Quality Beats", tag: "Originals" },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.15 }}
                      className="p-3 md:p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-xl flex flex-col justify-between group hover:border-orange-500/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-black transition-all">
                          <item.icon size={20} />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {item.tag}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-[10px] md:text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer specs banner */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-3 text-[11px] md:text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5 text-slate-200">
                    <ShieldCheck size={14} className="text-emerald-400" /> Full Warranty On Every Gadget
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-200">
                    <Truck size={14} className="text-sky-400" /> Fast Delivery Across Greater Accra & Nationwide
                  </span>
                </div>
              </motion.div>
            )}

            {/* SCENE 2: The Perks (Pay Small Small + Falaa Deals) */}
            {currentScene === 2 && (
              <motion.div
                key="scene-2"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col justify-center items-center p-6 md:p-12 text-center bg-gradient-to-br from-[#120a1c] via-[#0d0714] to-black"
              >
                <div className="max-w-3xl space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <Flame size={14} className="text-orange-400 fill-orange-400" />
                    Revolutionary Customer Perks
                  </div>

                  <h2 className="text-3xl md:text-6xl font-black text-white tracking-tight uppercase">
                    DON&apos;T BREAK THE BANK. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-300">
                      PAY SMALL SMALL.
                    </span>
                  </h2>

                  {/* 2 Big Pillars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-2">
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-purple-950/40 border border-purple-500/30 shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl" />
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCard size={28} className="text-purple-400" />
                        <div>
                          <h3 className="text-base md:text-lg font-black text-white">Pay Small Small</h3>
                          <p className="text-xs text-purple-300">Zero Pressure Financing</p>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-slate-300">
                        Take home your dream device today and spread payment across convenient, stress-free daily or monthly installments.
                      </p>
                    </motion.div>

                    <motion.div 
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-orange-950/40 border border-orange-500/30 shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl" />
                      <div className="flex items-center gap-3 mb-2">
                        <Zap size={28} className="text-orange-400 fill-orange-400/20" />
                        <div>
                          <h3 className="text-base md:text-lg font-black text-white">Falaa Deals</h3>
                          <p className="text-xs text-orange-300">Unbeatable Price Drops</p>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-slate-300">
                        Exclusive flash discounts and bundle drops every single week. Get quality gadgets at true wholesale rates.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCENE 3: The Grand Launch Celebration */}
            {currentScene === 3 && (
              <motion.div
                key="scene-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex flex-col justify-center items-center p-6 md:p-12 text-center bg-gradient-to-t from-black via-[#0d0914] to-[#1a0f2b]"
              >
                <div className="max-w-2xl space-y-5 relative z-20">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs md:text-sm font-bold uppercase tracking-widest shadow-lg">
                    <Sparkles size={16} /> Official Launch Celebration
                  </div>

                  <h2 className="text-3xl md:text-6xl font-black text-white tracking-tight uppercase">
                    CELEBRATE WITH US! <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">
                      GET 10% OFF TODAY
                    </span>
                  </h2>

                  <p className="text-xs md:text-base text-slate-300">
                    Use our exclusive launch coupon code on your checkout to enjoy special opening discounts storewide.
                  </p>

                  {/* Coupon Code Box */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/80 border-2 border-dashed border-orange-500/60 text-white font-mono text-lg md:text-xl font-bold tracking-wider">
                      <span>LAUNCH10</span>
                      <button
                        onClick={handleCopyCode}
                        className="p-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white transition-all cursor-pointer"
                        title="Copy coupon code"
                      >
                        {copiedCode ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>

                    <Link
                      href="/shop"
                      className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm md:text-base transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-orange-500/30 cursor-pointer select-none"
                    >
                      Start Shopping Now
                      <ArrowRight size={18} strokeWidth={2.8} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* VIDEO CONTROLS BAR (Auto fades or accessible at bottom) */}
          <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 md:p-6 space-y-2 opacity-95 group-hover:opacity-100 transition-opacity">
            
            {/* Scrubber Progress Bar */}
            <div 
              className="relative w-full h-2 bg-slate-800 rounded-full cursor-pointer overflow-hidden group/bar"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                handleSeek(Number((pos * TOTAL_DURATION).toFixed(1)));
              }}
            >
              <div 
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-100"
                style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
              />
            </div>

            {/* Bottom Row Controls */}
            <div className="flex items-center justify-between text-xs md:text-sm text-slate-300 font-medium">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-white" />}
                </button>

                <button
                  onClick={handleRestart}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Replay Video"
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                {/* Timestamps */}
                <span className="font-mono text-xs text-slate-400 pl-2">
                  0:{Math.floor(currentTime).toString().padStart(2, '0')} / 0:{TOTAL_DURATION}
                </span>
              </div>

              {/* Scene Indicators */}
              <div className="hidden sm:flex items-center gap-1.5">
                {SCENES.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => jumpToScene(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentScene === idx 
                        ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20' 
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    0{idx + 1} {scene.title}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Assets & Social Media Ready Kit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          
          {/* Card 1: Social Media Script */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
              <Share2 size={18} />
              <span>Launch Video Script</span>
            </div>
            <p className="text-xs text-slate-400">
              Voiceover script designed for 30s TikTok, Reels & WhatsApp Status commercials.
            </p>
            <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1.5 leading-relaxed">
              <p>&ldquo;Are you tired of fake gadgets and crazy prices? TEQVAULT is finally here! Get 100% genuine iPhones, laptops, and networking gear with full warranty. Use Pay Small Small or grab Falaa Deals today. Visit teqvault.app and use code LAUNCH10!&rdquo;</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText("Are you tired of fake gadgets and crazy prices? TEQVAULT is finally here! Get 100% genuine iPhones, laptops, and networking gear with full warranty. Use Pay Small Small or grab Falaa Deals today. Visit teqvault.app and use code LAUNCH10!");
                toast.success("Voiceover script copied!");
              }}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Copy Script
            </button>
          </div>

          {/* Card 2: Promotion Perks */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
              <Flame size={18} />
              <span>Launch Offer & Code</span>
            </div>
            <p className="text-xs text-slate-400">
              Official grand opening discount offer for buyers across Ghana.
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between p-2 rounded-lg bg-black/40 border border-slate-800">
                <span className="text-slate-400">Coupon:</span>
                <span className="font-mono font-bold text-orange-400">LAUNCH10 (10% OFF)</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-black/40 border border-slate-800">
                <span className="text-slate-400">Valid:</span>
                <span className="text-emerald-400 font-semibold">Storewide Launch Month</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-black/40 border border-slate-800">
                <span className="text-slate-400">Financing:</span>
                <span className="text-purple-400 font-semibold">Pay Small Small Enabled</span>
              </div>
            </div>
            <Link
              href="/shop"
              className="block text-center w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-slate-950 transition-colors cursor-pointer"
            >
              Browse Shop
            </Link>
          </div>

          {/* Card 3: Sharing & Quick Links */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
              <Zap size={18} />
              <span>Grand Opening Links</span>
            </div>
            <p className="text-xs text-slate-400">
              Direct links to key launch hubs across the storefront.
            </p>
            <div className="space-y-2 text-xs">
              <Link 
                href="/shop?deals=true" 
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 transition-colors"
              >
                <span>⚡ Falaa Deals Section</span>
                <ArrowRight size={14} className="text-orange-400" />
              </Link>
              <Link 
                href="/customer/pay-small-small" 
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 transition-colors"
              >
                <span>💳 Pay Small Small Info</span>
                <ArrowRight size={14} className="text-purple-400" />
              </Link>
              <Link 
                href="/contact" 
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 transition-colors"
              >
                <span>📞 Support & Inquiries</span>
                <ArrowRight size={14} className="text-sky-400" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
