import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Sparkles,
  Clock,
  Smartphone,
  Tv,
  Languages,
  Palette,
  Play,
  Copy,
  Check,
  Download,
  AlertCircle,
  HelpCircle,
  Bot,
  Layers,
  Send,
  Zap,
  Brain,
  Video,
  Cable,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Share2,
  RefreshCw,
  X
} from 'lucide-react';

const INSPIRATIONS = [
  {
    title: 'वाराणसी 2099: नियॉन घाट',
    prompt: 'साल 2099 में वाराणसी के प्राचीन गंगा घाटों पर तैरते हुए होलोग्राफिक दीये और एक युवा नाविक, जिसे एक रहस्यमयी प्राचीन डिजिटल शंख मिलता है।',
    lang: 'Hindi',
    duration: '60',
    style: 'Neon Cyberpunk'
  },
  {
    title: 'The Quantum Compass of Ladakh',
    prompt: 'A solitary Himalayan explorer finds an ancient mechanical compass buried under Pangong ice that points toward shifting timelines.',
    lang: 'English',
    duration: '60',
    style: 'Cinematic 35mm'
  },
  {
    title: 'ढाबे का सीक्रेट मसाला',
    prompt: 'हाईवे के एक पुराने ढाबे के बुजुर्ग बावर्ची के पास एक ऐसा गुप्त मसाला है जो लोगों की भूली हुई खुशियों की यादें लौटा देता है।',
    lang: 'Hindi',
    duration: '30',
    style: 'Cinematic 35mm'
  },
  {
    title: 'Tokyo Monsoon Cyber-Racer',
    prompt: 'An underground female cyber-tuner races through rain-drenched Shibuya crossings to deliver a sentient AI core before midnight.',
    lang: 'English',
    duration: '15',
    style: 'Anime 4K'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'chat' | 'pipeline' | 'saved'
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('60'); // 15, 30, 60
  const [aspectRatio, setAspectRatio] = useState('9:16'); // 9:16, 16:9
  const [language, setLanguage] = useState('English'); // English, Hindi
  const [style, setStyle] = useState('Cinematic 35mm');

  // Generation & Plan State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [thinkingLogs, setThinkingLogs] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);

  // Server API config
  const [serverConfig, setServerConfig] = useState({
    geminiConfigured: false,
    runwayConfigured: false,
    lumaConfigured: false,
    ffmpegAvailable: true
  });

  // Chat State
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: 'Namaste & Welcome to AI Video Maker Pro! I am your AI Creative Director & Script Doctor powered by Gemini. You can brainstorm video concepts with me, ask me to write viral hooks, translate dialogue into Hindi, or lock character continuity across your 60-second scenes. What are we creating today?',
      model: 'gemini-3.8-flash'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatModel, setChatModel] = useState('gemini-4-argon');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatThinkingLog, setChatThinkingLog] = useState(null);
  const chatEndRef = useRef(null);

  // Modals
  const [previewScene, setPreviewScene] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCombineModal, setShowCombineModal] = useState(false);
  const [combineStatus, setCombineStatus] = useState({ loading: false, url: null, error: null });
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch Server Config on Mount
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setServerConfig(data))
      .catch(() => {});

    // Load saved plans from localStorage
    try {
      const saved = localStorage.getItem('ai_video_plans');
      if (saved) setSavedPlans(JSON.parse(saved));
    } catch (_) {}
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatLoading, activeTab]);

  const showToast = (msg) => setToastMessage(msg);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate Video Plan
  const handleGeneratePlan = async () => {
    if (!prompt.trim()) {
      setErrorMessage('Please enter a story or video idea first.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setThinkingLogs(['Analyzing narrative pacing & character anchors...']);
    setGenerationProgress(`Deconstructing ${duration}s arc into sequential scenes in ${language}...`);

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration, aspectRatio, language, style })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate story plan.');
      }

      setCurrentPlan(data.plan);
      const updatedSaved = [data.plan, ...savedPlans.slice(0, 9)];
      setSavedPlans(updatedSaved);
      localStorage.setItem('ai_video_plans', JSON.stringify(updatedSaved));

      setThinkingLogs(prev => [...prev, 'Character consistency locked with visual anchor tags.', 'Sequential storyboard ready.']);
      setGenerationProgress('Video generation plan created successfully!');
      showToast('Storyboard generated successfully!');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Chat with Script Doctor
  const handleSendChat = async (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim() || isChatLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsChatLoading(true);
    setChatThinkingLog(chatModel === 'gemini-4-argon' ? 'Thinking with Gemini 4 Argon [Thinking: HIGH]...' : null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userMessage: text,
          model: chatModel,
          currentPlan
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: data.reply,
            model: chatModel,
            thinkingNotes: data.thinkingNotes
          }
        ]);
      } else {
        throw new Error(data.error || 'Failed to get director response');
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: `Director Notice: ${err.message}. How else can I assist with your scenes?`,
          model: chatModel
        }
      ]);
    } finally {
      setIsChatLoading(false);
      setChatThinkingLog(null);
    }
  };

  // Real Clip Generation Request
  const handleGenerateClip = async (scene) => {
    showToast(`Dispatching Scene ${scene.sceneNumber} prompt...`);
    try {
      const res = await fetch('/api/video/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scene, plan: currentPlan, provider: 'veo' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Honest error message: never fake video generation!
        showToast(`API Notice: ${data.error}`);
        alert(`Video Generation API Status:\n\n${data.error}`);
      } else {
        showToast(`Scene ${scene.sceneNumber} job started on ${data.provider.toUpperCase()}! Job ID: ${data.jobId}`);
      }
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Combine clips with server FFmpeg
  const handleCombineClips = async () => {
    setCombineStatus({ loading: true, url: null, error: null });
    setShowCombineModal(true);

    try {
      // In production, collect all generated scene clip URLs:
      const clipUrls = currentPlan?.scenes?.map(s => s.videoUrl).filter(Boolean) || [];

      // If no live clips generated yet, show the honest pipeline status
      if (clipUrls.length === 0) {
        setCombineStatus({
          loading: false,
          url: null,
          error: 'No rendered video clips found yet. Generate clips using an active Video API key (Veo, Runway, Luma), or view the Video API Hub to connect your rendering endpoint.'
        });
        return;
      }

      const res = await fetch('/api/video/combine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipUrls,
          title: currentPlan?.title || 'video',
          aspectRatio: currentPlan?.aspectRatio || '9:16'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to concatenate video clips.');
      }

      setCombineStatus({ loading: false, url: data.downloadUrl, error: null });
    } catch (err) {
      setCombineStatus({ loading: false, url: null, error: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-[#090C15] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#111524]/90 backdrop-blur-md border-b border-[#242F4E] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-sky-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Film className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base md:text-lg tracking-tight text-white">AI Video Maker</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-violet-600 text-white tracking-widest uppercase">PRO</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Cinematic Story Planner & Video Pipeline</p>
          </div>
        </div>

        {/* Server & API Status */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              serverConfig.geminiConfigured
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${serverConfig.geminiConfigured ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
            <span className="hidden xs:inline">{serverConfig.geminiConfigured ? 'Server Active' : 'API Hub'}</span>
          </button>

          <a
            href="/outputs/ai-video-maker-pro-web.zip"
            download="ai-video-maker-pro-web.zip"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition shadow-sm shadow-violet-600/30"
            title="Download Complete Web Project (.ZIP) to Phone"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Web ZIP</span>
            <span className="sm:hidden">ZIP</span>
          </a>

          {currentPlan && (
            <button
              onClick={() => setShowExportModal(true)}
              className="p-2 rounded-lg bg-[#181F36] border border-[#242F4E] hover:border-sky-400/50 text-sky-400 transition"
              title="Export Production JSON"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 pb-24 md:pb-12">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 mb-6 bg-[#111524] p-1 rounded-xl border border-[#242F4E]">
          {[
            { id: 'studio', label: 'Story Studio', icon: Film },
            { id: 'chat', label: 'Script Doctor AI', icon: Bot },
            { id: 'pipeline', label: 'Video API & FFmpeg', icon: Cable },
            { id: 'saved', label: `Saved (${savedPlans.length})`, icon: FolderOpen }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition touch-target ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#181F36]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: STORY STUDIO */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Curated Inspirations */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Inspiration Presets (Tap to Load)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {INSPIRATIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(item.prompt);
                      setLanguage(item.lang);
                      setDuration(item.duration);
                      setStyle(item.style);
                      showToast(`Loaded: ${item.title}`);
                    }}
                    className="text-left p-2.5 rounded-xl bg-[#111524] border border-[#242F4E] hover:border-violet-500/50 transition group"
                  >
                    <p className="font-bold text-xs text-slate-200 group-hover:text-violet-400 truncate">{item.title}</p>
                    <p className="text-[10px] text-sky-400 font-medium mt-0.5">{item.duration}s • {item.lang}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Story Prompt Input */}
            <div className="bg-[#111524] p-4 md:p-5 rounded-2xl border border-[#242F4E] shadow-xl">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                <Film className="w-4 h-4 text-violet-400" />
                <span>Story or Video Idea</span>
              </label>
              <textarea
                value={prompt}
                onChange={e => {
                  setPrompt(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                rows={4}
                placeholder="Enter your video concept or narrative arc here... (e.g. A cyberpunk chai vendor in Old Delhi discovers a brass quantum compass buried under rain-slicked stones that whispers future headlines in Hindi...)"
                className="w-full bg-[#090C15] border border-[#242F4E] focus:border-violet-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition resize-none"
              />

              {/* Controls Row: Duration, Aspect Ratio, Language */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                {/* Duration */}
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Duration</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { val: '15', label: '15s', scenes: '3 scn' },
                      { val: '30', label: '30s', scenes: '5 scn' },
                      { val: '60', label: '60s', scenes: '8 scn' }
                    ].map(d => (
                      <button
                        key={d.val}
                        type="button"
                        onClick={() => setDuration(d.val)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition text-center ${
                          duration === d.val
                            ? 'bg-gradient-to-r from-violet-600 to-sky-500 text-white border-transparent'
                            : 'bg-[#181F36] text-slate-300 border-[#242F4E] hover:border-slate-500'
                        }`}
                      >
                        <div>{d.label}</div>
                        <div className="text-[10px] font-normal opacity-75">{d.scenes}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Smartphone className="w-3.5 h-3.5 text-rose-400" />
                    <span>Aspect Ratio</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: '9:16', label: '9:16', desc: 'Shorts/Reels', icon: Smartphone },
                      { val: '16:9', label: '16:9', desc: 'YouTube', icon: Tv }
                    ].map(r => {
                      const Icon = r.icon;
                      return (
                        <button
                          key={r.val}
                          type="button"
                          onClick={() => setAspectRatio(r.val)}
                          className={`flex items-center justify-center space-x-2 py-2 px-2 rounded-xl text-xs font-bold border transition ${
                            aspectRatio === r.val
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                              : 'bg-[#181F36] text-slate-300 border-[#242F4E] hover:border-slate-500'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <div className="text-left">
                            <div>{r.label}</div>
                            <div className="text-[9px] font-normal text-slate-400">{r.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language Selection */}
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Languages className="w-3.5 h-3.5 text-amber-400" />
                    <span>Language</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'English', native: 'English' },
                      { val: 'Hindi', native: 'हिंदी' }
                    ].map(lang => (
                      <button
                        key={lang.val}
                        type="button"
                        onClick={() => setLanguage(lang.val)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                          language === lang.val
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                            : 'bg-[#181F36] text-slate-300 border-[#242F4E] hover:border-slate-500'
                        }`}
                      >
                        <div>{lang.native}</div>
                        <div className="text-[9px] font-normal text-slate-400">{lang.val}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual Style Selection */}
              <div className="mt-4">
                <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <Palette className="w-3.5 h-3.5 text-violet-400" />
                  <span>Visual Aesthetic</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Cinematic 35mm', 'Anime 4K', 'Hyper-Realistic', 'Neon Cyberpunk', '3D Stylized'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStyle(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        style === s
                          ? 'bg-violet-600/30 text-violet-300 border-violet-500'
                          : 'bg-[#181F36] text-slate-400 border-[#242F4E] hover:border-slate-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Progress Banner */}
              {isGenerating && (
                <div className="mt-4 p-3.5 rounded-xl bg-[#181F36] border border-sky-500/30 flex items-center space-x-3">
                  <RefreshCw className="w-5 h-5 text-sky-400 animate-spin shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-violet-300">Gemini 4 Argon: High Reasoning Pipeline</p>
                    <p className="text-xs text-slate-300">{generationProgress}</p>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="mt-5 w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-sky-500 hover:from-violet-500 hover:to-sky-400 text-white shadow-lg shadow-violet-600/25 flex items-center justify-center space-x-2 transition disabled:opacity-50 touch-target"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Planning Scenes ({duration}s)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Generate Video Storyboard ({duration}s • {duration === '15' ? '3' : duration === '30' ? '5' : '8'} Scenes)</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Thinking Logs */}
            {thinkingLogs.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#111524] border border-[#242F4E] space-y-1.5 text-xs">
                <div className="flex items-center space-x-2 font-bold text-violet-400">
                  <Brain className="w-4 h-4" />
                  <span>Narrative Architect Reasoning Logs</span>
                </div>
                {thinkingLogs.map((log, i) => (
                  <p key={i} className="text-slate-400 pl-6 border-l border-violet-500/30 text-[11px]">{log}</p>
                ))}
              </div>
            )}

            {/* GENERATED STORYBOARD SECTION */}
            {currentPlan && (
              <div className="space-y-5 animate-fade-in">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-[#111524] border border-[#242F4E]">
                  <div>
                    <h2 className="text-lg font-extrabold text-white">{currentPlan.title}</h2>
                    <p className="text-xs text-sky-400 font-semibold mt-0.5">
                      {currentPlan.duration} • {currentPlan.scenes.length} Scenes • {currentPlan.aspectRatio} • {currentPlan.language}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{currentPlan.logline}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCombineClips}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center space-x-1.5 transition"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Stitch Video (FFmpeg)</span>
                    </button>
                  </div>
                </div>

                {/* Character Continuity Locker */}
                <div className="p-4 rounded-xl bg-[#111524] border border-violet-500/40 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Visual Continuity & Character Lock</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Synced across all scenes</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#090C15] text-[11px] font-mono text-sky-300 border border-[#242F4E]">
                    Aesthetic Lock: {currentPlan.masterConsistencyLock}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {currentPlan.characters?.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[#181F36] border border-[#242F4E] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{c.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-600/30 text-violet-300 font-semibold">{c.role}</span>
                        </div>
                        <p className="text-[11px] text-slate-300"><span className="text-slate-500 font-medium">Appearance:</span> {c.visualAppearance}</p>
                        <p className="text-[11px] text-slate-300"><span className="text-slate-500 font-medium">Wardrobe:</span> {c.wardrobeAndProps}</p>
                        <p className="text-[10px] text-sky-400 font-mono">{c.continuityAnchorTag}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Honest API Status Note */}
                <div className="p-3 rounded-xl bg-[#181F36] border border-[#242F4E] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Cable className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Per policy: No fake video is simulated. Connect an API in Video API Hub to render clips.</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('pipeline')}
                    className="text-xs font-bold text-sky-400 hover:underline shrink-0 ml-2"
                  >
                    API Guide →
                  </button>
                </div>

                {/* Sequential Scene Cards */}
                <div className="space-y-4">
                  {currentPlan.scenes?.map(scene => (
                    <div
                      key={scene.sceneNumber}
                      className="p-4 rounded-xl bg-[#111524] border border-[#242F4E] hover:border-slate-600 transition space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 rounded-md bg-gradient-to-r from-violet-600 to-sky-500 text-slate-900 font-black text-xs">
                            SCENE {scene.sceneNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#181F36] text-sky-400 text-xs font-bold">
                            {scene.timeRange}
                          </span>
                        </div>

                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-sky-400/30 bg-sky-500/10 text-sky-400">
                          PROMPT READY
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-white">{scene.title}</h3>

                      {/* Badges: Camera & Lighting */}
                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        <span className="px-2 py-1 rounded bg-[#181F36] text-slate-300 border border-[#242F4E]">
                          📷 {scene.cameraMovement}
                        </span>
                        <span className="px-2 py-1 rounded bg-[#181F36] text-slate-300 border border-[#242F4E]">
                          💡 {scene.lightingAndColor}
                        </span>
                      </div>

                      {/* Text-to-Video Visual Prompt */}
                      <div className="p-3 rounded-xl bg-[#090C15] border border-[#242F4E] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Text-To-Video AI Prompt (Runway / Veo / Sora)
                          </span>
                          <button
                            onClick={() => copyToClipboard(scene.visualPrompt, `prompt_${scene.sceneNumber}`)}
                            className="p-1 rounded hover:bg-[#181F36] text-sky-400 transition"
                            title="Copy Prompt"
                          >
                            {copiedId === `prompt_${scene.sceneNumber}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">{scene.visualPrompt}</p>
                      </div>

                      {/* Dialogue / Voiceover */}
                      {scene.voiceoverOrDialogue && (
                        <div className="p-2.5 rounded-lg bg-[#181F36]/60 border border-[#242F4E] text-xs">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                            Voiceover / Dialogue ({currentPlan.language})
                          </span>
                          <p className="text-slate-100 font-medium italic">"{scene.voiceoverOrDialogue}"</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => setPreviewScene(scene)}
                          className="flex-1 py-2 px-3 rounded-lg bg-[#181F36] hover:bg-[#242F4E] text-sky-400 font-bold text-xs border border-[#242F4E] flex items-center justify-center space-x-1.5 transition"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Preview Frame</span>
                        </button>

                        <button
                          onClick={() => handleGenerateClip(scene)}
                          className="flex-1 py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Generate Clip</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SCRIPT DOCTOR CHAT */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-[75vh] bg-[#111524] rounded-2xl border border-[#242F4E] p-4">
            {/* Model Selector Bar */}
            <div className="flex items-center space-x-2 pb-3 border-b border-[#242F4E]">
              <span className="text-xs font-bold text-slate-400 uppercase hidden sm:inline">Model:</span>
              {[
                { id: 'gemini-4-argon', label: 'Gemini 4 Argon', tag: 'High Reasoning', icon: Brain },
                { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', tag: 'General', icon: Bot },
                { id: 'gemini-3.1-flash-lite', label: '3.1 Flash-Lite', tag: 'Fast', icon: Zap }
              ].map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setChatModel(m.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      chatModel === m.id
                        ? 'bg-violet-600/30 text-violet-300 border-violet-500'
                        : 'bg-[#181F36] text-slate-400 border-[#242F4E]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Suggestions */}
            <div className="flex items-center space-x-2 py-2 overflow-x-auto no-scrollbar">
              {[
                { label: 'Write viral hook', prompt: 'Write 3 viral opening hooks for Scene 1 with high emotional tension.' },
                { label: 'Translate to Hindi', prompt: 'Translate dialogue for all scenes into poetic and dramatic Hindi.' },
                { label: 'Audit character consistency', prompt: 'Audit my character continuity: ensure jacket and traits match in all scene prompts.' }
              ].map((pill, i) => (
                <button
                  key={i}
                  onClick={() => handleSendChat(pill.prompt)}
                  className="px-2.5 py-1 rounded-full bg-[#181F36] hover:bg-[#242F4E] border border-[#242F4E] text-[11px] text-sky-400 whitespace-nowrap transition"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto space-y-3.5 p-2 pr-1">
              {messages.map(msg => {
                const isUser = msg.role === 'user';
                return (
                  <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    {!isUser && msg.model && (
                      <span className="text-[10px] text-violet-400 font-bold mb-1 pl-1">
                        {msg.model} {msg.thinkingNotes && `• ${msg.thinkingNotes}`}
                      </span>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-violet-600 to-sky-500 text-white rounded-br-none shadow-md'
                          : 'bg-[#181F36] text-slate-200 border border-[#242F4E] rounded-bl-none whitespace-pre-wrap'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isChatLoading && (
                <div className="flex items-center space-x-2 text-xs text-sky-400 p-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{chatThinkingLog || 'Director is thinking...'}</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendChat();
              }}
              className="pt-3 border-t border-[#242F4E] flex items-center space-x-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask Script Doctor (e.g. rewrite Scene 3 in Hindi)..."
                className="flex-1 bg-[#090C15] border border-[#242F4E] focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: VIDEO API & FFMPEG STITCHING HUB */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#111524] border border-[#242F4E]">
              <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                <Cable className="w-5 h-5 text-sky-400" />
                <span>Production Video API & Concatenation Architecture</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                How AI Video Maker Pro handles real video generation APIs, rate limits, and combines clips into a single MP4 on the backend.
              </p>
            </div>

            {/* Step 1: Connecting APIs */}
            <div className="p-4 rounded-xl bg-[#111524] border border-[#242F4E] space-y-3">
              <div className="flex items-center space-x-2 text-sm font-bold text-sky-400">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-xs font-black">1</span>
                <span>Connecting Legitimate Video Generation APIs</span>
              </div>
              <p className="text-xs text-slate-300">
                AI Video generation requires asynchronous endpoints because rendering 5-10 second clips takes 30-120 seconds per scene. Supported models:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-[#090C15] border border-[#242F4E]">
                  <p className="font-bold text-violet-400">Google Veo / Gemini Omni Flash</p>
                  <code className="text-[11px] text-amber-300 block font-mono mt-0.5">POST https://generativelanguage.googleapis.com/v1beta/interactions</code>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Uses Gemini Interactions API. Sends prompt, duration (5s/10s), and aspect_ratio. Polls interaction ID until completed.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#090C15] border border-[#242F4E]">
                  <p className="font-bold text-sky-400">Runway Gen-3 Alpha API</p>
                  <code className="text-[11px] text-amber-300 block font-mono mt-0.5">POST https://api.runwayml.com/v1/image_to_video</code>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Direct developer API using Bearer Token. Supports camera motion control sliders and seed continuity.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#090C15] border border-[#242F4E]">
                  <p className="font-bold text-emerald-400">Luma Dream Machine Ray</p>
                  <code className="text-[11px] text-amber-300 block font-mono mt-0.5">POST https://api.lumalabs.ai/dream-machine/v1/generations</code>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Physics-accurate keyframe generation API with prompt extensions.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Rate Limits */}
            <div className="p-4 rounded-xl bg-[#111524] border border-[#242F4E] space-y-3">
              <div className="flex items-center space-x-2 text-sm font-bold text-amber-400">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-black">2</span>
                <span>Handling Usage Limits & Concurrency</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400">•</span>
                  <span><strong>Sequential Queue:</strong> Never dispatch all 8 scenes of a 60s video simultaneously. Video APIs enforce strict 1-2 concurrent rendering slots per tier.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400">•</span>
                  <span><strong>Exponential Backoff:</strong> Poll task status every 5 seconds, scaling by 1.5x up to a 30s cap to prevent HTTP 429 errors.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400">•</span>
                  <span><strong>Cost Guard:</strong> Display estimated API credit costs before launching multi-clip jobs.</span>
                </li>
              </ul>
            </div>

            {/* Step 3: FFmpeg Stitching */}
            <div className="p-4 rounded-xl bg-[#111524] border border-[#242F4E] space-y-3">
              <div className="flex items-center space-x-2 text-sm font-bold text-emerald-400">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-black">3</span>
                <span>Combining Generated Clips into a Single MP4</span>
              </div>
              <p className="text-xs text-slate-300">
                The Express backend uses <code>/usr/bin/ffmpeg</code> to combine all sequential clips losslessly via concat demuxer:
              </p>
              <div className="p-3 rounded-lg bg-[#090C15] font-mono text-[11px] text-slate-300 border border-[#242F4E] space-y-1">
                <p className="text-slate-500"># 1. Create filelist.txt</p>
                <p>file 'scene_1.mp4'</p>
                <p>file 'scene_2.mp4'</p>
                <p>file 'scene_3.mp4'</p>
                <p className="text-slate-500 mt-2"># 2. Lossless Concat Demuxer</p>
                <p className="text-emerald-400">ffmpeg -f concat -safe 0 -i filelist.txt -c copy final_video.mp4</p>
              </div>
            </div>

            {/* Step 4: Security */}
            <div className="p-4 rounded-xl bg-[#181F36] border border-emerald-500/30 flex items-center space-x-3 text-xs">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Server-Side Secret Protection</p>
                <p className="text-slate-400">
                  API keys are stored strictly in the server environment (<code>process.env.GEMINI_API_KEY</code>). Keys are never returned to client browsers.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SAVED PLANS */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white">Saved Generation Plans ({savedPlans.length})</h2>
              {savedPlans.length > 0 && (
                <button
                  onClick={() => {
                    localStorage.removeItem('ai_video_plans');
                    setSavedPlans([]);
                    showToast('Cleared saved plans');
                  }}
                  className="text-xs text-red-400 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {savedPlans.length === 0 ? (
              <div className="text-center py-16 bg-[#111524] rounded-2xl border border-[#242F4E] p-6 space-y-2">
                <FolderOpen className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="font-bold text-slate-300">No saved plans yet</p>
                <p className="text-xs text-slate-500">Generate a storyboard in Story Studio to save your first production plan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedPlans.map((plan, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setCurrentPlan(plan);
                      setPrompt(plan.logline);
                      setActiveTab('studio');
                      showToast(`Loaded: ${plan.title}`);
                    }}
                    className="p-4 rounded-xl bg-[#111524] border border-[#242F4E] hover:border-violet-500/50 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-violet-400">{plan.title}</h3>
                      <p className="text-xs text-sky-400 mt-0.5">
                        {plan.duration} • {plan.scenes?.length || 0} scenes • {plan.aspectRatio} • {plan.language}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-1">{plan.logline}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 shrink-0 ml-4" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Sticky Bottom Nav for Phones */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111524]/95 backdrop-blur-lg border-t border-[#242F4E] px-2 py-1.5 flex items-center justify-around safe-bottom">
        {[
          { id: 'studio', label: 'Studio', icon: Film },
          { id: 'chat', label: 'Script AI', icon: Bot },
          { id: 'pipeline', label: 'Video API', icon: Cable },
          { id: 'saved', label: 'Saved', icon: FolderOpen }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-bold transition ${
                isActive ? 'text-violet-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Frame Preview Modal */}
      {previewScene && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111524] border border-[#242F4E] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Scene {previewScene.sceneNumber} Frame Preview ({aspectRatio})</h3>
              <button onClick={() => setPreviewScene(null)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewport Frame */}
            <div className="flex justify-center">
              <div
                className={`bg-gradient-to-b from-[#090C15] via-violet-950/20 to-[#090C15] border-2 border-sky-400/80 rounded-xl relative overflow-hidden flex flex-col justify-between p-3 ${
                  aspectRatio === '9:16' ? 'w-48 h-80' : 'w-full h-48'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-mono text-sky-400">
                  <span>REC 4K</span>
                  <span>{previewScene.timeRange}</span>
                </div>

                <div className="text-center space-y-1">
                  <Play className="w-8 h-8 text-sky-400/80 mx-auto fill-current" />
                  <p className="text-[10px] text-slate-400 font-mono">ARRI Alexa 35mm</p>
                </div>

                {previewScene.voiceoverOrDialogue && (
                  <div className="bg-black/75 p-1.5 rounded text-center">
                    <p className="text-[10px] text-amber-300 font-medium italic">"{previewScene.voiceoverOrDialogue}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p><strong>Camera:</strong> {previewScene.cameraMovement}</p>
              <p><strong>Lighting:</strong> {previewScene.lightingAndColor}</p>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => copyToClipboard(previewScene.visualPrompt, 'modal_prompt')}
                className="flex-1 py-2 rounded-lg bg-[#181F36] border border-[#242F4E] text-xs font-bold text-sky-400 hover:bg-[#242F4E] transition"
              >
                Copy Prompt
              </button>
              <button
                onClick={() => setPreviewScene(null)}
                className="flex-1 py-2 rounded-lg bg-violet-600 text-xs font-bold text-white hover:bg-violet-500 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Plan Modal */}
      {showExportModal && currentPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111524] border border-[#242F4E] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Export Video Production Plan (JSON)</h3>
              <button onClick={() => setShowExportModal(false)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              readOnly
              rows={12}
              value={JSON.stringify(currentPlan, null, 2)}
              className="w-full bg-[#090C15] font-mono text-[11px] text-sky-300 p-3 rounded-xl border border-[#242F4E] focus:outline-none"
            />

            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(JSON.stringify(currentPlan, null, 2), 'export_json')}
                className="flex-1 py-2.5 rounded-lg bg-violet-600 text-xs font-bold text-white hover:bg-violet-500 flex items-center justify-center space-x-1.5 transition"
              >
                <Copy className="w-4 h-4" />
                <span>Copy JSON</span>
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 rounded-lg bg-[#181F36] text-xs font-bold text-slate-300 hover:bg-[#242F4E] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Combine / Stitch Modal */}
      {showCombineModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111524] border border-[#242F4E] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">FFmpeg Video Clip Stitcher</h3>
              <button onClick={() => setShowCombineModal(false)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {combineStatus.loading ? (
              <div className="text-center py-8 space-y-3">
                <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
                <p className="text-xs font-bold text-white">Concatenating clips with FFmpeg...</p>
                <p className="text-[11px] text-slate-400">Merging MP4 audio and video streams losslessly.</p>
              </div>
            ) : combineStatus.error ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Pipeline Notice</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{combineStatus.error}</p>
              </div>
            ) : combineStatus.url ? (
              <div className="text-center py-6 space-y-3">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white">Video Stitching Complete!</p>
                <a
                  href={combineStatus.url}
                  download
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Assembled MP4</span>
                </a>
              </div>
            ) : null}

            <button
              onClick={() => setShowCombineModal(false)}
              className="w-full py-2 rounded-lg bg-[#181F36] text-xs font-bold text-slate-300 hover:bg-[#242F4E] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 px-4 py-2.5 rounded-xl bg-[#181F36] border border-sky-400/40 text-sky-300 text-xs font-bold shadow-2xl animate-fade-in flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
