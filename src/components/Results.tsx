import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { questions, Category } from '../data/questions';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Award, AlertTriangle, RefreshCw, BookOpen, Sparkles, Lightbulb, Twitter, Facebook, Linkedin, Moon, Sun, Target, BarChart3 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface ResultsProps {
  answers: Record<string, string>;
  onRestart: () => void;
}

export default function Results({ answers, onRestart }: ResultsProps) {
  const results = useMemo(() => {
    const scores: Record<Category, { total: number; correct: number }> = {
      'Information & Media Literacy': { total: 0, correct: 0 },
      'Privacy & Security': { total: 0, correct: 0 },
      'Digital Footprint & Identity': { total: 0, correct: 0 },
      'Digital Communication & Etiquette': { total: 0, correct: 0 },
    };

    let totalCorrect = 0;

    questions.forEach(q => {
      scores[q.category].total += 1;
      const selectedOptionId = answers[q.id];
      const selectedOption = q.options.find(o => o.id === selectedOptionId);
      
      if (selectedOption?.isCorrect) {
        scores[q.category].correct += 1;
        totalCorrect += 1;
      }
    });

    const chartData = Object.entries(scores).map(([category, data]) => {
      const shortName = category.split(' & ')[0];
      return {
        subject: `${shortName} (${category})`, // Include full name alongside shortened
        fullSubject: category,
        score: Math.round((data.correct / data.total) * 100),
        fullMark: 100,
      };
    });

    return { scores, totalCorrect, chartData };
  }, [answers]);

  const totalScorePercentage = Math.round((results.totalCorrect / questions.length) * 100);

  const getFeedback = () => {
    if (totalScorePercentage >= 80) return { title: "Digital Native Master", text: "Excellent! You have a strong grasp of digital literacy concepts. Keep staying informed as technology evolves.", icon: <Award className="w-12 h-12 text-emerald-500" /> };
    if (totalScorePercentage >= 50) return { title: "Digital Explorer", text: "Good job! You know the basics, but there are areas where you can improve your digital safety and awareness.", icon: <BookOpen className="w-12 h-12 text-amber-500" /> };
    return { title: "Digital Novice", text: "It looks like you have some learning to do. Growing up with tech doesn't mean you automatically know how to navigate it safely.", icon: <AlertTriangle className="w-12 h-12 text-rose-500" /> };
  };

  const feedback = getFeedback();

  const shareText = `I just scored ${totalScorePercentage}% on the Digital Literacy Assessment and earned the title "${feedback.title}"! Test your digital skills here:`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';

  const lowestCategory = [...results.chartData].sort((a, b) => a.score - b.score)[0];
  const strongestCategory = [...results.chartData].sort((a, b) => b.score - a.score)[0];

  const getTipsForCategory = (category: string) => {
    switch (category) {
      case 'Information & Media Literacy':
        return "Always cross-reference information with reliable sources. Check the author's credentials and look for bias before sharing news.";
      case 'Privacy & Security':
        return "Use strong, unique passwords for every account and enable Two-Factor Authentication (2FA) wherever possible. Be wary of phishing attempts.";
      case 'Digital Footprint & Identity':
        return "Regularly review your privacy settings on social media. Remember that what you post online can be permanent and visible to future employers.";
      case 'Digital Communication & Etiquette':
        return "Think before you type. Treat others with respect online, and be mindful of your tone, as text can easily be misinterpreted.";
      default:
        return "Keep learning and exploring digital literacy topics to stay safe online.";
    }
  };

  const getStrengthForCategory = (category: string) => {
    switch (category) {
      case 'Information & Media Literacy':
        return "You excel at evaluating sources and identifying credible information. Your critical thinking skills help you navigate the complex digital media landscape effectively.";
      case 'Privacy & Security':
        return "You have a strong understanding of how to protect your personal data. Your knowledge of secure passwords and phishing prevention keeps your digital life safe.";
      case 'Digital Footprint & Identity':
        return "You are highly aware of your online presence. You understand how to manage your digital reputation and the long-term impact of what you share online.";
      case 'Digital Communication & Etiquette':
        return "You communicate respectfully and effectively online. You understand the nuances of digital interactions and maintain a positive online environment.";
      default:
        return "You have a solid foundation in digital literacy principles.";
    }
  };

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(true);
  const [loadingText, setLoadingText] = useState("Analyzing your digital profile...");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
  };

  useEffect(() => {
    if (!isGeneratingImage) {
      setGenerationProgress(100);
      return;
    }
    
    setGenerationProgress(0);
    const duration = 12000; // 12 seconds
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      currentStep++;
      // Calculate progress with an ease-out curve so it slows down near the end
      const progress = 1 - Math.pow(1 - currentStep / steps, 3);
      setGenerationProgress(Math.min(Math.round(progress * 99), 99)); // Cap at 99% until actually done
    }, intervalTime);
    
    return () => clearInterval(progressInterval);
  }, [isGeneratingImage]);

  useEffect(() => {
    if (!isGeneratingImage) return;
    
    const messages = [
      "Analyzing your digital profile...",
      "Designing your unique avatar...",
      "Applying neon aesthetics...",
      "Finalizing masterpiece..."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingText(messages[i]);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [isGeneratingImage]);

  useEffect(() => {
    const generateImage = async () => {
      try {
        setIsGeneratingImage(true);
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
        
        let categoryVisuals = "";
        switch (strongestCategory.fullSubject) {
          case 'Information & Media Literacy':
            categoryVisuals = "glowing magnifying glasses, floating data streams being sorted, and illuminated puzzle pieces representing truth and knowledge";
            break;
          case 'Privacy & Security':
            categoryVisuals = "high-tech glowing cyber-shields, futuristic padlocks, and protective energy fields surrounding digital data";
            break;
          case 'Digital Footprint & Identity':
            categoryVisuals = "a constellation of glowing nodes forming a digital silhouette, and illuminated footprints leaving a positive mark on a cyber grid";
            break;
          case 'Digital Communication & Etiquette':
            categoryVisuals = "harmonious glowing speech bubbles, interconnected light trails, and bridges of light connecting digital spaces";
            break;
          default:
            categoryVisuals = "glowing digital nodes and interconnected tech elements";
        }
        
        let scoreModifiers = "";
        let visualMetaphor = "";
        let colorPalette = "";
        let lighting = "";

        if (totalScorePercentage >= 90) {
          scoreModifiers = "masterpiece, highly detailed, triumphant, advanced technology, dynamic composition, epic scale, futuristic";
          visualMetaphor = "a towering, illuminated digital metropolis, complex interconnected networks operating flawlessly, a glowing crown of data";
          colorPalette = "vibrant neon cyan, electric purple, and bright gold accents";
          lighting = "dramatic studio lighting, glowing auras, lens flares, high contrast";
        } else if (totalScorePercentage >= 75) {
          scoreModifiers = "polished, confident, steady progress, clear pathways, building blocks of technology, active learning";
          visualMetaphor = "a well-structured digital city under construction, glowing bridges connecting data islands, a clear path leading upward";
          colorPalette = "bright and encouraging, soft pastel blues, greens, and warm oranges";
          lighting = "bright, even studio lighting, soft shadows, welcoming atmosphere";
        } else if (totalScorePercentage >= 50) {
          scoreModifiers = "instructional, foundational, welcoming, stepping stones, learning environment, supportive mood";
          visualMetaphor = "a digital workshop, blueprints coming to life, puzzle pieces being assembled, a glowing compass pointing forward";
          colorPalette = "muted calming colors, soft teals, warm yellows, and light grays";
          lighting = "soft, diffused lighting, gentle glows, clear visibility";
        } else {
          scoreModifiers = "basic, introductory, clear diagrams, blueprint aesthetic, safe space, highly instructional";
          visualMetaphor = "a single glowing seed of data planted in a digital grid, a simple map with a clear starting point, basic geometric shapes forming a structure";
          colorPalette = "monochrome with a single bright accent color (like a guiding light), soft slate and indigo";
          lighting = "flat, clear lighting, no harsh shadows, diagrammatic style";
        }
        
        const prompt = `A premium 3D isometric illustration representing a "${feedback.title}". The central theme focuses on ${strongestCategory.fullSubject}, visually represented by ${categoryVisuals}. 
        Visual Metaphor: ${visualMetaphor}. 
        Atmosphere and Style: ${scoreModifiers}. 
        Color Palette: ${colorPalette}. 
        Lighting: ${lighting}. 
        Art style: Modern tech aesthetic, smooth gradients, Behance style, digital art.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9",
            }
          }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            setImageUrl(`data:image/png;base64,${base64EncodeString}`);
            break;
          }
        }
      } catch (error) {
        console.error("Failed to generate image:", error);
      } finally {
        setIsGeneratingImage(false);
      }
    };

    generateImage();
  }, [feedback.title, results.chartData]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        <div className="flex justify-end">
          <button
            onClick={toggleTheme}
            className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full shadow-sm hover:shadow-md transition-all text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl dark:shadow-indigo-900/10 overflow-hidden transition-colors duration-300 border border-slate-100 dark:border-slate-800"
        >
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="mb-8 p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl"
              >
                {React.cloneElement(feedback.icon as React.ReactElement, { className: "w-16 h-16 text-indigo-300" })}
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.4 }}
                className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
              >
                {feedback.title}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xl md:text-2xl text-indigo-100/90 max-w-3xl mx-auto mb-12 font-medium leading-relaxed"
              >
                {feedback.text}
              </motion.p>
              
              <div className="flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-10 w-full max-w-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0.5 }}
                  className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 drop-shadow-sm relative z-10 animate-gradient-x"
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  >
                    {totalScorePercentage}
                  </motion.span>
                  %
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-indigo-200/70 mt-4 font-bold uppercase tracking-widest text-sm relative z-10"
                >
                  Overall Score ({results.totalCorrect} / {questions.length})
                </motion.div>
              </div>
              
              {/* Social Share Buttons */}
              <div className="flex items-center justify-center gap-4">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-5 h-5 text-white" />
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </a>
                <a 
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent("Digital Literacy Assessment")}&summary=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* AI Generated Avatar Section */}
          <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center transition-colors duration-300">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Your Digital Avatar</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-center max-w-2xl mb-8">
              Based on your score and your strongest skill ({strongestCategory.fullSubject}), our AI has generated a unique avatar just for you.
            </p>
            
            {isGeneratingImage ? (
              <div className="w-full max-w-3xl aspect-video bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xl p-8 text-center relative overflow-hidden">
                {/* Background ambient glow */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <div className="w-96 h-96 bg-indigo-500 rounded-full blur-[100px] animate-pulse"></div>
                </div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative mb-10">
                    <div className="p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                      <Sparkles className="w-12 h-12 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                    </div>
                    <motion.div 
                      className="absolute inset-0 border-4 border-indigo-400 dark:border-indigo-500 rounded-full"
                      animate={{ scale: [1, 1.8, 2.5], opacity: [1, 0.5, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div 
                      className="absolute inset-0 border-4 border-purple-400 dark:border-purple-500 rounded-full"
                      animate={{ scale: [1, 1.5, 2], opacity: [0, 0.8, 0] }}
                      transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <motion.span 
                      key={loadingText}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-slate-800 dark:text-slate-100 font-bold text-2xl tracking-wide"
                    >
                      {loadingText}
                    </motion.span>
                    
                    {/* Animated Dots */}
                    <div className="flex items-center gap-1.5 pt-2">
                      <motion.div
                        className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full"
                        animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full"
                        animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full"
                        animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-base text-slate-500 dark:text-slate-400 mb-10 max-w-md leading-relaxed">
                    Our AI is crafting a personalized masterpiece based on your unique skill profile and score.
                  </p>

                  {/* Enhanced Progress Bar */}
                  <div className="w-full max-w-md flex flex-col items-center">
                    <div className="flex justify-between w-full text-sm font-black text-indigo-600 dark:text-indigo-400 mb-3 tracking-widest uppercase">
                      <span>Generating...</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <div className="w-full h-4 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner relative">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 relative"
                        animate={{ 
                          width: `${generationProgress}%`, 
                          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
                        }}
                        transition={{ 
                          width: { duration: 0.1, ease: "linear" },
                          backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
                        }}
                        style={{ backgroundSize: "200% 100%" }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg)' }}></div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            ) : imageUrl ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="w-full max-w-3xl rounded-[2rem] overflow-hidden shadow-2xl dark:shadow-indigo-900/20 border border-slate-200 dark:border-slate-700 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end justify-center pb-8">
                  <span className="text-white font-medium px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                    Your Digital Avatar
                  </span>
                </div>
                <motion.img 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  src={imageUrl} 
                  alt="Digital Literacy Avatar" 
                  className="w-full h-auto object-cover relative z-0" 
                  referrerPolicy="no-referrer" 
                />
              </motion.div>
            ) : (
              <div className="w-full max-w-3xl aspect-video bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-md">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Avatar generation failed.</span>
              </div>
            )}
          </div>

          <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Radar Chart */}
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Skill Profile</h3>
              <div 
                className="w-full h-[300px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl" 
                role="application" 
                aria-label="Radar chart showing your skill profile across different digital literacy categories. Use Tab to navigate through the data points."
                tabIndex={0}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="55%" data={results.chartData}>
                    <PolarGrid stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={(props: any) => {
                        const { payload, x, y, textAnchor } = props;
                        const match = payload.value.match(/^(.*?)\s*\((.*?)\)$/);
                        const shortName = match ? match[1] : payload.value;
                        const fullName = match ? match[2] : '';
                        
                        return (
                          <text x={x} y={y} textAnchor={textAnchor} fill={isDarkMode ? "#cbd5e1" : "#334155"}>
                            <tspan x={x} dy="0em" fontSize={12} fontWeight={600}>{shortName}</tspan>
                            {fullName && <tspan x={x} dy="1.2em" fontSize={10} fontWeight={400} fill={isDarkMode ? "#94a3b8" : "#475569"}>({fullName})</tspan>}
                          </text>
                        );
                      }} 
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar 
                      name="Score" 
                      dataKey="score" 
                      stroke={isDarkMode ? '#a5b4fc' : '#4338ca'} 
                      strokeWidth={2}
                      fill={isDarkMode ? '#818cf8' : '#4f46e5'} 
                      fillOpacity={0.5} 
                      label={{ fill: isDarkMode ? '#a5b4fc' : '#4338ca', fontSize: 12, fontWeight: 'bold' }}
                      isAnimationActive={true}
                      animationDuration={1500}
                      animationEasing="ease-out"
                      activeDot={{ r: 8, fill: isDarkMode ? '#818cf8' : '#4f46e5', stroke: isDarkMode ? '#1e293b' : '#ffffff', strokeWidth: 2 }}
                      dot={(props: any) => {
                        const { cx, cy, payload, value, onMouseEnter, onMouseLeave } = props;
                        return (
                          <circle
                            key={payload.subject}
                            cx={cx}
                            cy={cy}
                            r={5}
                            fill={isDarkMode ? '#a5b4fc' : '#4338ca'}
                            className="focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50 cursor-pointer hover:r-6 transition-all duration-300"
                            role="graphics-symbol"
                            aria-label={`${payload.fullSubject} score: ${value}%`}
                            tabIndex={0}
                            onFocus={onMouseEnter}
                            onBlur={onMouseLeave}
                          />
                        );
                      }}
                    />
                    <Tooltip 
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 transform transition-all">
                              <p className="font-semibold text-slate-800 dark:text-slate-100 mb-1">{data.fullSubject}</p>
                              <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">Score: {data.score}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                      cursor={{ stroke: isDarkMode ? '#475569' : '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex flex-col justify-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Category Breakdown
              </h3>
              <div className="space-y-6" role="list" aria-label="Category scores breakdown">
                {results.chartData.map((data, index) => {
                  const isLow = data.score < 50;
                  const isMid = data.score >= 50 && data.score < 80;
                  const isHigh = data.score >= 80;
                  
                  let barColor = "bg-indigo-500";
                  let textColor = "text-indigo-600 dark:text-indigo-400";
                  let bgColor = "bg-indigo-100 dark:bg-indigo-900/30";
                  
                  if (isLow) {
                    barColor = "bg-rose-500 dark:bg-rose-400";
                    textColor = "text-rose-600 dark:text-rose-400";
                    bgColor = "bg-rose-100 dark:bg-rose-900/30";
                  } else if (isMid) {
                    barColor = "bg-amber-500 dark:bg-amber-400";
                    textColor = "text-amber-600 dark:text-amber-400";
                    bgColor = "bg-amber-100 dark:bg-amber-900/30";
                  } else if (isHigh) {
                    barColor = "bg-emerald-500 dark:bg-emerald-400";
                    textColor = "text-emerald-600 dark:text-emerald-400";
                    bgColor = "bg-emerald-100 dark:bg-emerald-900/30";
                  }

                  return (
                    <motion.div 
                      key={data.fullSubject}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      role="listitem"
                      tabIndex={0}
                      aria-label={`${data.fullSubject}: ${data.score}%`}
                      className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 rounded-xl p-3 -mx-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300"
                    >
                      <div className="flex justify-between items-end mb-2" aria-hidden="true">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          {data.fullSubject}
                        </span>
                        <div className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${bgColor} ${textColor}`}>
                          {data.score}%
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-3 shadow-inner overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${data.score}%` }}
                          transition={{ duration: 1, delay: 0.4 + index * 0.1, type: "spring", bounce: 0.2 }}
                          className={`h-full rounded-full ${barColor} relative`}
                        >
                          <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg)' }}></div>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Personalized Analysis Section */}
              <div className="mt-10 space-y-4">
                {/* Strength Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/50 transition-colors duration-300 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Top Strength: {strongestCategory.fullSubject}</h4>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                        {getStrengthForCategory(strongestCategory.fullSubject)}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Tips Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50 transition-colors duration-300 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Focus Area: {lowestCategory.fullSubject}</h4>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                        {getTipsForCategory(lowestCategory.fullSubject)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-8 md:p-12 border-t border-slate-100 dark:border-slate-800 flex justify-center transition-colors duration-300">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRestart}
              className="group relative flex items-center gap-4 px-12 py-6 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-full font-black text-xl transition-all shadow-xl hover:shadow-2xl hover:shadow-indigo-500/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg)' }}></div>
              <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700 ease-in-out relative z-10" />
              <span className="relative z-10">Retake Assessment</span>
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
