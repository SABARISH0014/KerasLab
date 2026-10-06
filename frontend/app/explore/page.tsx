"use client";

import { useState } from "react";
import { Info, Layers, GraduationCap } from "lucide-react";

export default function ExplorePage() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const explanations: Record<string, { title: string, simple: string, technical: string }> = {
    input: {
      title: "Input Layer (784 features)",
      simple: "This is where the image enters the neural network. Each pixel of the 28x28 image becomes one number.",
      technical: "The 28x28 2D image array is 'flattened' into a 1D vector of 784 values (28 * 28 = 784). These values are normalized between 0 and 1."
    },
    hidden: {
      title: "Hidden Layer (128 neurons)",
      simple: "This layer finds patterns in the pixels, like loops, lines, and edges.",
      technical: "A Dense (fully connected) layer where each of the 128 neurons receives input from all 784 previous nodes, each with its own learned weight and bias."
    },
    relu: {
      title: "ReLU Activation",
      simple: "ReLU helps the neural network learn complex patterns by ignoring negative numbers.",
      technical: "Rectified Linear Unit (ReLU) applies the function f(x) = max(0, x) to the output of the neurons, introducing non-linearity into the network."
    },
    output: {
      title: "Output Layer (10 neurons)",
      simple: "This layer gives us the final answer. It has 10 neurons, one for each digit from 0 to 9.",
      technical: "A Dense layer with 10 units that aggregates the learned features to produce raw scores (logits) for the 10 classes."
    },
    softmax: {
      title: "Softmax Activation",
      simple: "Softmax turns the raw scores into percentages (probabilities) that add up to 100%.",
      technical: "The Softmax function normalizes the output vector into a probability distribution over the 10 predicted output classes."
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Neural Network Explorer</h1>
        <p className="text-slate-400 text-lg">Click on the parts of the network to learn how they work.</p>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Interactive Architecture Visualization */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <div className="w-full flex justify-between items-center h-96 relative px-4 lg:px-8">
            {/* Connection Lines (simplified via CSS) */}
            <div className="absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-slate-800 -z-10 -translate-y-1/2" />
            
            {/* Input Node */}
            <div 
              className={`flex flex-col items-center gap-4 cursor-pointer group ${activeNode === 'input' ? 'scale-110' : ''} transition-transform`}
              onClick={() => setActiveNode('input')}
            >
              <div className={`w-24 h-48 rounded-xl border-2 flex items-center justify-center bg-slate-950 ${activeNode === 'input' ? 'border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.4)]' : 'border-slate-700 group-hover:border-blue-400'}`}>
                <div className="flex flex-col gap-1 items-center">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-blue-400" />
                  ))}
                  <div className="text-slate-500 text-xs my-1">...</div>
                  <div className="text-xs text-blue-300 font-medium">784</div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-slate-200">INPUT</h3>
                <p className="text-xs text-slate-500">784 features</p>
              </div>
            </div>

            {/* Hidden Node */}
            <div 
              className={`flex flex-col items-center gap-4 cursor-pointer group ${activeNode === 'hidden' || activeNode === 'relu' ? 'scale-110' : ''} transition-transform`}
              onClick={() => setActiveNode('hidden')}
            >
              <div className={`w-20 h-40 rounded-xl border-2 flex items-center justify-center bg-slate-950 relative ${activeNode === 'hidden' || activeNode === 'relu' ? 'border-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.4)]' : 'border-slate-700 group-hover:border-indigo-400'}`}>
                <div className="flex flex-col gap-2 items-center">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-indigo-400" />
                  ))}
                  <div className="text-xs text-indigo-300 font-medium">128</div>
                </div>
                
                {/* ReLU Tag */}
                <button 
                  className={`absolute -right-4 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-bold rounded bg-indigo-500 text-white hover:bg-indigo-400`}
                  onClick={(e) => { e.stopPropagation(); setActiveNode('relu'); }}
                >
                  ReLU
                </button>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-slate-200">HIDDEN</h3>
                <p className="text-xs text-slate-500">Dense Layer</p>
              </div>
            </div>

            {/* Output Node */}
            <div 
              className={`flex flex-col items-center gap-4 cursor-pointer group ${activeNode === 'output' || activeNode === 'softmax' ? 'scale-110' : ''} transition-transform`}
              onClick={() => setActiveNode('output')}
            >
              <div className={`w-16 h-32 rounded-xl border-2 flex items-center justify-center bg-slate-950 relative ${activeNode === 'output' || activeNode === 'softmax' ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.4)]' : 'border-slate-700 group-hover:border-green-400'}`}>
                <div className="flex flex-col gap-2 items-center">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-green-400" />
                  ))}
                  <div className="text-xs text-green-300 font-medium">10</div>
                </div>

                 {/* Softmax Tag */}
                 <button 
                  className={`absolute -left-4 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-bold rounded bg-green-500 text-white hover:bg-green-400`}
                  onClick={(e) => { e.stopPropagation(); setActiveNode('softmax'); }}
                >
                  Softmax
                </button>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-slate-200">OUTPUT</h3>
                <p className="text-xs text-slate-500">0 to 9</p>
              </div>
            </div>

          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative">
          <Layers className="absolute top-8 right-8 w-12 h-12 text-slate-800" />
          
          {activeNode ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-2xl font-bold text-blue-400 pr-16">{explanations[activeNode].title}</h2>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4" /> Simple Explanation
                </div>
                <p className="text-lg text-slate-200 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  {explanations[activeNode].simple}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Technical Details
                </div>
                <p className="text-sm text-slate-400 leading-relaxed border-l-2 border-slate-700 pl-4 py-1">
                  {explanations[activeNode].technical}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <GraduationCap className="w-16 h-16 text-slate-600" />
              <p className="text-lg">Click any part of the network on the left to learn what it does.</p>
            </div>
          )}
        </div>
      </div>

      {/* MNIST Explorer Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold">The MNIST Dataset</h2>
            <p className="text-slate-400 text-lg">
              To train our network, we need examples. The <strong>MNIST</strong> dataset is like the "Hello World" of deep learning. It contains 70,000 images of handwritten digits (0-9).
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Image Size: 28 × 28 pixels</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Format: Grayscale (0 = black, 255 = white)</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500" /> Classes: 10 (Digits 0 through 9)</li>
            </ul>
          </div>
          
          <div className="w-full md:w-1/2 bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <div className="grid grid-cols-5 gap-2">
              {/* Fake MNIST grid for visualization */}
              {[7, 2, 1, 0, 4, 1, 4, 9, 5, 9, 0, 6, 9, 0, 1].map((digit, i) => (
                <div key={i} className="aspect-square bg-slate-800 rounded-md flex items-center justify-center relative overflow-hidden group">
                  <span className="text-2xl font-bold text-slate-400 opacity-20 filter blur-[1px]">
                    {digit}
                  </span>
                  <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold text-white">28x28</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
