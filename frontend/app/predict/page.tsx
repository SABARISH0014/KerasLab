"use client";

import { useEffect, useRef, useState } from "react";
import { PenTool, Eraser, Sparkles, ArrowRight } from "lucide-react";

export default function PredictPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill background with black (MNIST convention)
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Calculate scale in case the canvas is displayed smaller than its actual coordinate size
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
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      // Draw a dot in case of a single tap
      ctx.fillStyle = "white";
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 24; // Thick enough to be visible when scaled down to 28x28
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setResult(null);
    setError(null);
  };

  const handlePredict = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsPredicting(true);
    setError(null);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError("Failed to process drawing.");
        setIsPredicting(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", blob, "digit.png");

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/predict`, {
          method: "POST",
          body: formData
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Prediction failed");
        
        setResult(data);
      } catch (err: any) {
        setError("We couldn't process the image. Is the backend running? " + err.message);
      } finally {
        setIsPredicting(false);
      }
    }, "image/png");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Draw a Digit</h1>
        <p className="text-slate-400 text-lg">Draw a number from 0 to 9 in the box below and let the model predict it.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Canvas Section */}
        <div className="space-y-6 flex flex-col items-center">
          <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-2xl">
            <canvas
              ref={canvasRef}
              width={280} // 10x the 28x28 size for drawing resolution
              height={280}
              className="bg-black rounded-xl cursor-crosshair touch-none border-2 border-slate-700 hover:border-blue-500 transition-colors"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          
          <div className="flex gap-4 w-full max-w-[280px]">
            <button 
              onClick={clearCanvas}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
            >
              <Eraser className="w-5 h-5" /> Clear
            </button>
            <button 
              onClick={handlePredict}
              disabled={isPredicting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isPredicting ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <><Sparkles className="w-5 h-5" /> Predict</>
              )}
            </button>
          </div>
          
          {error && (
            <p className="text-red-400 text-sm text-center max-w-[280px]">{error}</p>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-8">
          {result ? (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl animate-in fade-in slide-in-from-right-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-slate-400 font-semibold mb-1 uppercase tracking-wider text-sm">Predicted Digit</h3>
                  <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-500">
                    {result.prediction}
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-slate-400 font-semibold mb-1 uppercase tracking-wider text-sm">Confidence</h3>
                  <div className="text-4xl font-light text-slate-200">
                    {(result.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-800">
                <h4 className="font-semibold text-slate-300">How Keras processed your digit</h4>
                
                {/* Visual Pipeline */}
                <div className="bg-slate-950 rounded-xl p-4 flex justify-between items-center text-xs text-slate-400 border border-slate-800">
                  <div className="text-center"><div className="w-8 h-8 mx-auto bg-slate-800 rounded mb-2 flex items-center justify-center text-white">28²</div>Pixels</div>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <div className="text-center"><div className="w-8 h-8 mx-auto bg-slate-800 rounded mb-2 flex items-center justify-center text-blue-400">784</div>Input</div>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <div className="text-center"><div className="w-8 h-8 mx-auto bg-slate-800 rounded mb-2 flex items-center justify-center text-indigo-400">128</div>ReLU</div>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <div className="text-center"><div className="w-8 h-8 mx-auto bg-slate-800 rounded mb-2 flex items-center justify-center text-green-400">10</div>Softmax</div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <h4 className="font-semibold text-slate-300">All Probabilities</h4>
                <div className="space-y-2">
                  {result.probabilities.map((prob: number, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-4 font-mono text-slate-500">{idx}</span>
                      <div className="flex-1 h-3 bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${idx === result.prediction ? 'bg-blue-500' : 'bg-slate-700'}`}
                          style={{ width: `${Math.max(prob * 100, 1)}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs font-mono text-slate-400">
                        {(prob * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
             <div className="h-full min-h-[400px] border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4">
               <PenTool className="w-16 h-16 text-slate-700" />
               <p className="text-xl font-semibold text-slate-400">Waiting for your drawing...</p>
               <p className="text-slate-500 max-w-sm">
                 Draw a digit on the left and click predict. The model will analyze the pixels and tell you what number it sees.
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
