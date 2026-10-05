import Link from "next/link";
import { ArrowRight, Brain, Cpu, Database } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          KerasLab
        </h1>
        <p className="text-2xl text-slate-300 font-light">
          Learn Deep Learning by Experimenting
        </p>
        <div className="pt-8 flex justify-center gap-4">
          <Link 
            href="/explore" 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            Start Experimenting <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Educational Content */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-colors">
          <Brain className="w-12 h-12 text-blue-400 mb-6" />
          <h2 className="text-xl font-bold mb-4">What is Deep Learning?</h2>
          <p className="text-slate-400 leading-relaxed">
            Deep learning is a type of machine learning inspired by the human brain. It uses artificial neural networks to learn patterns from large amounts of data, like recognizing handwritten digits.
          </p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-indigo-500/50 transition-colors">
          <Cpu className="w-12 h-12 text-indigo-400 mb-6" />
          <h2 className="text-xl font-bold mb-4">What is Keras?</h2>
          <p className="text-slate-400 leading-relaxed">
            Keras is an open-source deep learning API written in Python. It provides a clean, simple, and beginner-friendly interface to build and train neural networks quickly.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-purple-500/50 transition-colors">
          <Database className="w-12 h-12 text-purple-400 mb-6" />
          <h2 className="text-xl font-bold mb-4">What is a Neural Network?</h2>
          <p className="text-slate-400 leading-relaxed">
            A network of interconnected "neurons" arranged in layers. Data flows from the <strong>Input Layer</strong>, through one or more <strong>Hidden Layers</strong> where learning happens, to the <strong>Output Layer</strong>.
          </p>
        </div>
      </section>

      {/* Visual Pipeline */}
      <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <h2 className="text-2xl font-bold text-center mb-12">The Classification Pipeline</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <div className="flex-1">
            <div className="w-20 h-20 bg-slate-800 rounded-xl mx-auto flex items-center justify-center border border-slate-700 mb-4 shadow-inner">
              <span className="text-3xl font-bold text-slate-300">7</span>
            </div>
            <h3 className="font-semibold text-blue-300">Input Image</h3>
            <p className="text-sm text-slate-500 mt-2">28×28 pixels</p>
          </div>
          
          <ArrowRight className="w-8 h-8 text-slate-600 hidden md:block" />
          
          <div className="flex-1">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-3 h-20 bg-blue-500/20 rounded-full flex flex-col justify-between overflow-hidden">
                  <div className={`w-full bg-blue-400 rounded-full`} style={{ height: `${Math.random() * 100}%` }}></div>
                </div>
              ))}
            </div>
            <h3 className="font-semibold text-indigo-300">Hidden Layers</h3>
            <p className="text-sm text-slate-500 mt-2">Finding patterns</p>
          </div>

          <ArrowRight className="w-8 h-8 text-slate-600 hidden md:block" />

          <div className="flex-1">
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-16 h-20 bg-green-500/10 rounded-xl border border-green-500/30 flex items-center justify-center flex-col">
                <span className="text-xs text-green-400">Prob</span>
                <span className="text-xl font-bold text-green-400">98%</span>
              </div>
            </div>
            <h3 className="font-semibold text-purple-300">Prediction</h3>
            <p className="text-sm text-slate-500 mt-2">"It's a seven"</p>
          </div>
        </div>
      </section>
    </div>
  );
}
