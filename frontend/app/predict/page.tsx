"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Sparkles, AlertCircle } from "lucide-react";

interface CanvasProps {
  index: number;
  canvasRef: (el: HTMLCanvasElement | null) => void;
  onClear: () => void;
}

const DigitCanvas = ({ index, canvasRef, onClear }: CanvasProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const internalRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = internalRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = internalRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = internalRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.fillStyle = "white";
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = internalRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 12; // Adjusted for 140x140 canvas
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = internalRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-slate-400 font-semibold text-sm">Digit {index + 1}</div>
      <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-xl w-full">
        <canvas
          ref={(el) => {
            internalRef.current = el;
            canvasRef(el);
          }}
          width={140}
          height={140}
          className="bg-black rounded-lg cursor-crosshair touch-none border-2 border-slate-700 hover:border-blue-500 transition-colors w-full aspect-square"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <button 
        onClick={handleClear}
        className="text-xs flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
      >
        <Eraser className="w-3 h-3" /> Clear
      </button>
    </div>
  );
};

interface PredictionResult {
  prediction: string;
  digits: number[];
  confidences: number[];
  probabilities?: number[][];
  digit_count: number;
}

export default function PredictPage() {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCanvasBlank = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    // 0xFF000000 is black in little-endian. We check if there's any non-black pixel.
    return !pixelBuffer.some(color => color !== 0xFF000000);
  };

  const handlePredict = async () => {
    setIsPredicting(true);
    setError(null);
    setResult(null);

    // Validate all canvases
    for (let i = 0; i < 10; i++) {
      const canvas = canvasRefs.current[i];
      if (!canvas || isCanvasBlank(canvas)) {
        setError("Please draw all 10 digits before recognition.");
        setIsPredicting(false);
        return;
      }
    }

    const formData = new FormData();
    
    // Get blobs from all canvases
    const blobPromises = canvasRefs.current.map((canvas, index) => {
      return new Promise<void>((resolve, reject) => {
        if (!canvas) {
          reject(new Error("Canvas not found"));
          return;
        }
        canvas.toBlob((blob) => {
          if (blob) {
            formData.append("files", blob, `digit_${index}.png`);
            resolve();
          } else {
            reject(new Error(`Failed to process canvas ${index}`));
          }
        }, "image/png");
      });
    });

    try {
      await Promise.all(blobPromises);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/predict/batch`, {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Prediction failed");
      
      setResult(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError("Unable to connect to the prediction server. " + (errorMessage !== "Failed to fetch" ? errorMessage : ""));
    } finally {
      setIsPredicting(false);
    }
  };

  const handleClearAll = () => {
    canvasRefs.current.forEach(canvas => {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Handwritten Number Recognition
        </h1>
        <p className="text-slate-400 text-lg">Draw each digit in its own box below</p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 md:gap-6 justify-center max-w-5xl mx-auto">
          {Array.from({ length: 10 }).map((_, i) => (
            <DigitCanvas 
              key={i} 
              index={i} 
              canvasRef={(el) => { canvasRefs.current[i] = el; }}
              onClear={() => {}}
            />
          ))}
        </div>

        <div className="flex flex-col items-center space-y-4 pt-6">
          <div className="flex gap-4 w-full max-w-md">
            <button 
              onClick={handleClearAll}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
            >
              Clear All
            </button>
            <button 
              onClick={handlePredict}
              disabled={isPredicting}
              className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isPredicting ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Recognizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Recognize Number
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-sm w-full max-w-md">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 pt-8 border-t border-slate-800">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
            <h3 className="text-slate-400 font-semibold uppercase tracking-wider text-sm">Predicted Mobile Number</h3>
            <div className="text-5xl md:text-7xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-500">
              {result.prediction}
            </div>
          </div>

          <div className="space-y-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50">
            <h4 className="font-semibold text-slate-300 text-center uppercase tracking-wider text-sm mb-4">Digit Predictions & Analysis</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {result.digits.map((digit: number, idx: number) => (
                <div key={idx} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-2">
                  <div className="text-xs text-slate-500 font-medium">Digit {idx + 1}</div>
                  <div className="flex items-end gap-2">
                    <div className="text-4xl font-bold text-white">{digit}</div>
                    {result.confidences && (
                      <div className="text-[10px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded mb-1">
                        {(result.confidences[idx] * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  {result.probabilities && (
                    <div className="w-full pt-2 mt-2 border-t border-slate-800/50">
                      <div className="text-[9px] text-slate-500 text-center mb-1 uppercase tracking-wider">Probability Dist (0-9)</div>
                      <div className="flex items-end justify-between h-12 gap-[2px]">
                        {result.probabilities[idx].map((prob: number, classIdx: number) => (
                          <div key={classIdx} className="w-full flex flex-col items-center gap-[2px] group relative">
                            <div 
                              className={`w-full rounded-t-[1px] transition-all ${classIdx === digit ? 'bg-blue-400' : 'bg-slate-700 hover:bg-slate-500'}`}
                              style={{ height: `${Math.max(prob * 100, 2)}%` }}
                            ></div>
                            <div className="text-[8px] text-slate-500 leading-none">{classIdx}</div>
                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg pointer-events-none z-10 transition-opacity whitespace-nowrap border border-slate-700">
                              {(prob * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
