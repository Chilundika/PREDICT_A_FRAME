"use client";

import React, { type ReactNode, useCallback, useMemo, useState, useEffect } from "react";
import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
  useNotification,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Transaction,
  TransactionButton,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionError,
  TransactionResponse,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction";
import { useAccount } from "wagmi";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  icon,
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:pointer-events-none rounded-lg font-inter";

  const variantClasses = {
    primary: "bg-gray-900 hover:bg-gray-800 text-white shadow-sm",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-600",
  };

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="flex items-center mr-2">{icon}</span>}
      {children}
    </button>
  );
}

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

function Card({ title, children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 font-inter">
            {title}
          </h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

type IconProps = {
  name: "play" | "pause" | "stop" | "clear" | "plus" | "check" | "arrow-right";
  size?: "sm" | "md" | "lg";
  className?: string;
}

function Icon({ name, size = "md", className = "" }: IconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const icons = {
    play: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    ),
    pause: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
    ),
    stop: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      </svg>
    ),
    clear: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
        <line x1="18" y1="9" x2="12" y2="15"></line>
        <line x1="12" y1="9" x2="18" y2="15"></line>
      </svg>
    ),
    plus: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    check: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    "arrow-right": (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
  };

  return (
    <span className={`inline-block ${sizeClasses[size]} ${className}`}>
      {icons[name]}
    </span>
  );
}

// Type definitions for the drum machine
type InstrumentName = 'kick' | 'snare' | 'hihat' | 'openhat' | 'clap';
type Pattern = Record<InstrumentName, number[]>;
type PresetName = 'techno' | 'house' | 'trap' | 'breakbeat' | 'minimal';

// Drum Machine Component
function DrumMachine() {
  const STEPS = 16;
  const instruments: InstrumentName[] = useMemo(() => ['kick', 'snare', 'hihat', 'openhat', 'clap'], []);
  
  const presets: Record<PresetName, Pattern> = {
    techno: {
      kick:    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      snare:   [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat:   [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
      openhat: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      clap:    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
    },
    house: {
      kick:    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      snare:   [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat:   [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
      openhat: [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
      clap:    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
    },
    trap: {
      kick:    [1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0],
      snare:   [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      hihat:   [1,0,1,0,1,0,1,0,1,1,0,1,0,1,1,1],
      openhat: [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
      clap:    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
    },
    breakbeat: {
      kick:    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],
      snare:   [0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0],
      hihat:   [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      openhat: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
      clap:    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    },
    minimal: {
      kick:    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
      snare:   [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      hihat:   [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
      openhat: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      clap:    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
    }
  };

  const [pattern, setPattern] = useState<Pattern>(() => {
    const initialPattern: Pattern = {} as Pattern;
    instruments.forEach(inst => {
      initialPattern[inst] = new Array(STEPS).fill(0);
    });
    return initialPattern;
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [beatInput, setBeatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const sendNotification = useNotification();

  // Audio synthesis functions
  const playSound = useCallback((inst: InstrumentName) => {
    if (!audioContext) return;
    
    const now = audioContext.currentTime;
    
    switch(inst) {
      case 'kick':
        const kickOsc = audioContext.createOscillator();
        const kickGain = audioContext.createGain();
        kickOsc.connect(kickGain);
        kickGain.connect(audioContext.destination);
        kickOsc.frequency.setValueAtTime(60, now);
        kickOsc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
        kickGain.gain.setValueAtTime(1, now);
        kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        kickOsc.start(now);
        kickOsc.stop(now + 0.5);
        break;
        
      case 'snare':
        const snareBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
        const snareData = snareBuffer.getChannelData(0);
        for (let i = 0; i < snareBuffer.length; i++) {
          snareData[i] = Math.random() * 2 - 1;
        }
        const snareSource = audioContext.createBufferSource();
        snareSource.buffer = snareBuffer;
        const snareGain = audioContext.createGain();
        snareSource.connect(snareGain);
        snareGain.connect(audioContext.destination);
        snareGain.gain.setValueAtTime(0.3, now);
        snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        snareSource.start(now);
        break;
        
      case 'hihat':
      case 'openhat':
        const hihatBuffer = audioContext.createBuffer(1, audioContext.sampleRate * (inst === 'openhat' ? 0.3 : 0.05), audioContext.sampleRate);
        const hihatData = hihatBuffer.getChannelData(0);
        for (let i = 0; i < hihatBuffer.length; i++) {
          hihatData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioContext.sampleRate * 0.1));
        }
        const hihatSource = audioContext.createBufferSource();
        hihatSource.buffer = hihatBuffer;
        const hihatGain = audioContext.createGain();
        const hihatFilter = audioContext.createBiquadFilter();
        hihatFilter.type = 'highpass';
        hihatFilter.frequency.value = 8000;
        hihatSource.connect(hihatFilter);
        hihatFilter.connect(hihatGain);
        hihatGain.connect(audioContext.destination);
        hihatGain.gain.setValueAtTime(0.1, now);
        hihatGain.gain.exponentialRampToValueAtTime(0.01, now + (inst === 'openhat' ? 0.3 : 0.05));
        hihatSource.start(now);
        break;
        
      case 'clap':
        const clapBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const clapData = clapBuffer.getChannelData(0);
        for (let i = 0; i < clapBuffer.length; i++) {
          clapData[i] = Math.random() * 2 - 1;
        }
        const clapSource = audioContext.createBufferSource();
        clapSource.buffer = clapBuffer;
        const clapGain = audioContext.createGain();
        clapSource.connect(clapGain);
        clapGain.connect(audioContext.destination);
        clapGain.gain.setValueAtTime(0.2, now);
        clapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        clapSource.start(now);
        break;
    }
  }, [audioContext]);

  const advanceSequencer = useCallback(() => {
    instruments.forEach(inst => {
      if (pattern[inst][currentStep]) {
        playSound(inst);
      }
    });
    setCurrentStep((prev) => (prev + 1) % STEPS);
  }, [currentStep, pattern, playSound, STEPS, instruments]);

  useEffect(() => {
    if (isPlaying) {
      const interval = (60 / tempo / 4) * 1000;
      const id = setInterval(advanceSequencer, interval);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [isPlaying, tempo, advanceSequencer, intervalId]);

  const play = () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      setAudioContext(ctx);
    }
    setIsPlaying(!isPlaying);
  };

  const stop = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const clear = () => {
    const clearedPattern: Pattern = {} as Pattern;
    instruments.forEach(inst => {
      clearedPattern[inst] = new Array(STEPS).fill(0);
    });
    setPattern(clearedPattern);
  };

  const toggleStep = (inst: InstrumentName, step: number) => {
    setPattern(prev => ({
      ...prev,
      [inst]: prev[inst].map((val: number, idx: number) => idx === step ? (val ? 0 : 1) : val)
    }));
  };

  const loadPreset = async (presetName: PresetName) => {
    if (presets[presetName]) {
      setPattern({ ...presets[presetName] });
      await sendNotification({
        title: "Preset Loaded",
        body: `Loaded ${presetName} preset`,
      });
    }
  };

  // AI Beat Generation with Claude API
  const generateBeat = async () => {
    if (!beatInput.trim()) {
      setStatusMessage("Please describe the beat you want");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 100,
          messages: [
            { 
              role: "user", 
              content: `Given this drum beat description: "${beatInput}", classify it into one of these categories: techno, house, trap, breakbeat, or minimal. Respond with ONLY the category name in lowercase, nothing else.`
            }
          ]
        })
      });
      
      const data = await response.json();
      const preset = data.content[0].text.trim().toLowerCase();
      
      if (presets[preset as PresetName]) {
        setPattern({ ...presets[preset as PresetName] });
        setStatusMessage(`Generated ${preset} beat`);
        await sendNotification({
          title: "Beat Generated",
          body: `Created a ${preset} beat from your description`,
        });
      } else {
        // Default to techno if classification fails
        setPattern({ ...presets.techno });
        setStatusMessage("Generated techno beat");
        await sendNotification({
          title: "Beat Generated",
          body: "Created a techno beat",
        });
      }
      setBeatInput("");
    } catch (error) {
      console.error('Generation error:', error);
      setStatusMessage("Generation failed. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Rhythm Machine">
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 uppercase tracking-wider mb-4">
              AI-Powered • Model 002
            </div>
          </div>
          
          {/* AI Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={beatInput}
              onChange={(e) => setBeatInput(e.target.value)}
              placeholder="Describe your beat (e.g., 'minimal techno', 'trap drums')"
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              onKeyDown={(e) => e.key === 'Enter' && !isGenerating && generateBeat()}
              disabled={isGenerating}
            />
            <Button 
              onClick={generateBeat} 
              size="sm" 
              className="whitespace-nowrap"
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>

          {/* Quick Ideas */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Try:</span>
            {['techno', 'house', 'trap', 'breakbeat', 'minimal'].map(style => (
              <button
                key={style}
                onClick={() => { setBeatInput(style); }}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                disabled={isGenerating}
              >
                {style}
              </button>
            ))}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="text-sm text-center text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-2">
              {statusMessage}
            </div>
          )}
        </div>
      </Card>

      <Card title="Sequencer">
        <div className="space-y-4">
          {/* Transport Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={play}
                size="sm"
                icon={<Icon name={isPlaying ? "pause" : "play"} size="sm" />}
              >
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button onClick={stop} size="sm" variant="outline" icon={<Icon name="stop" size="sm" />}>
                Stop
              </Button>
              <Button onClick={clear} size="sm" variant="outline" icon={<Icon name="clear" size="sm" />}>
                Clear
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Tempo</span>
              <input
                type="range"
                min="60"
                max="180"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm font-mono text-gray-700 min-w-[60px]">
                {tempo} BPM
              </span>
            </div>
          </div>

          {/* Step Sequencer Grid */}
          <div className="space-y-2">
            {instruments.map((inst) => (
              <div key={inst} className="grid-cols-17 grid gap-1 items-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide px-2">
                  {inst}
                </div>
                {Array.from({ length: STEPS }, (_, step) => (
                  <button
                    key={step}
                    onClick={() => toggleStep(inst, step)}
                    className={`aspect-square text-xs rounded transition-all ${
                      pattern[inst][step]
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                    } ${
                      step === currentStep && isPlaying
                        ? 'ring-2 ring-orange-300 scale-110'
                        : ''
                    }`}
                  >
                    {step + 1}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Presets */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Presets:</span>
            {Object.keys(presets).map(preset => (
              <Button
                key={preset}
                onClick={() => loadPreset(preset as PresetName)}
                size="sm"
                variant="outline"
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Share Beat Component
function ShareBeat() {
  const { address } = useAccount();
  const sendNotification = useNotification();

  const calls = useMemo(() => address ? [{
    to: address,
    data: "0x" as `0x${string}`,
    value: BigInt(0),
  }] : [], [address]);

  const handleSuccess = useCallback(async (response: TransactionResponse) => {
    const transactionHash = response.transactionReceipts[0].transactionHash;
    
    console.log(`Transaction successful: ${transactionHash}`);
    
    await sendNotification({
      title: "Beat Shared!",
      body: `Your beat has been shared on-chain! ${transactionHash}`,
    });
  }, [sendNotification]);

  return (
    <Card title="Share Your Beat">
      <div className="space-y-4 text-center">
        <p className="text-sm text-gray-600">
          Share your beat creation on-chain with{" "}
          <a href="https://onchainkit.xyz" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            OnchainKit
          </a>
        </p>

        <div className="flex justify-center">
          {address ? (
            <Transaction 
              calls={calls} 
              onSuccess={handleSuccess} 
              onError={(error: TransactionError) => 
                console.error("Transaction failed:", error)
              }
            >
              <TransactionButton className="text-white bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-medium" />
              <TransactionStatus>
                <TransactionStatusAction />
                <TransactionStatusLabel />
              </TransactionStatus>
              <TransactionToast className="mb-4">
                <TransactionToastIcon />
                <TransactionToastLabel />
                <TransactionToastAction />
              </TransactionToast>
            </Transaction>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                Connect your wallet to share beats on-chain
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Main App Component
export default function RhythmMiniApp() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-orange-600"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-2 text-sm font-medium text-green-600 animate-pulse">
          <Icon name="check" size="sm" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="w-full max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
            <Wallet className="z-10">
              <ConnectWallet>
                <Name className="text-inherit" />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
          
          <div className="flex items-center space-x-3">
            {saveFrameButton}
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-6">
          <DrumMachine />
          <ShareBeat />
        </main>

        {/* Footer */}
        <footer className="mt-8 pt-6 flex justify-center border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 text-xs"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            Built on Base with MiniKit
          </Button>
        </footer>
      </div>
    </div>
  );
}