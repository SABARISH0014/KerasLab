"use client";

import { useState } from "react";
import { Settings, Code, Play, CheckCircle, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function BuildPage() {
  const [neurons, setNeurons] = useState(128);
  const [activation, setActivation] = useState("relu");
  const [epochs, setEpochs] = useState(5);
  
  const [isTraining, setIsTraining] = useState(false);
  const [trainResult, setTrainResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const kerasCode = `model = keras.Sequential([
    keras.Input(shape=(784,)),
    layers.Dense(${neurons}, activation="${activation}"),
    layers.Dense(10, activation="softmax")
])

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.fit(x_train, y_train, epochs=${epochs})`;

  const handleTrain = async () => {
    setIsTraining(true);
    setError(null);
    setTrainResult(null);
    
    try {
      const response = await fetch("http://localhost:8000/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            hidden_units: neurons,
            activation: activation,
            epochs: epochs
          }
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Training failed");
      
      // Transform history data for recharts
      const chartData = data.history.accuracy.map((acc: number, idx: number) => ({
        epoch: idx + 1,
        accuracy: acc,
        loss: data.history.loss[idx],
        val_accuracy: data.history.val_accuracy?.[idx],
        val_loss: data.history.val_loss?.[idx]
      }));
      
      setTrainResult({ ...data, chartData });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">Model Builder</h1>
        <p className="text-slate-400 text-lg">Configure your neural network, see the code, and train it.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Settings className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold">Configuration</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="font-semibold text-slate-200">Hidden Neurons</label>
                <span className="text-blue-400 font-mono">{neurons}</span>
              </div>
              <input 
                type="range" 
                min="32" 
                max="256" 
                step="32"
                value={neurons}
                onChange={(e) => setNeurons(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              <p className="text-xs text-slate-500">More neurons can learn more complex patterns, but take longer to train and might overfit.</p>
            </div>

            <div className="space-y-3">
              <label className="font-semibold text-slate-200 block">Activation Function</label>
              <select 
                value={activation}
                onChange={(e) => setActivation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500 transition-colors"
              >
                <option value="relu">ReLU (Recommended)</option>
                <option value="tanh">Tanh</option>
                <option value="sigmoid">Sigmoid</option>
              </select>
              <p className="text-xs text-slate-500">How the neuron decides to pass its signal. ReLU is usually best for hidden layers.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="font-semibold text-slate-200">Epochs</label>
                <span className="text-blue-400 font-mono">{epochs}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={epochs}
                onChange={(e) => setEpochs(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              <p className="text-xs text-slate-500">How many times the network sees the entire dataset. (Max 10 for this demo)</p>
            </div>
          </div>

          <button 
            onClick={handleTrain}
            disabled={isTraining}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isTraining 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            }`}
          >
            {isTraining ? (
              <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> Training...</>
            ) : (
              <><Play className="w-5 h-5" /> Train Model</>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-xl flex gap-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Code & Results Panel */}
        <div className="space-y-8 flex flex-col">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 relative flex-1 group">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Code className="w-5 h-5" />
                <span className="font-semibold text-sm tracking-wide uppercase">Generated Keras Code</span>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(kerasCode)}
                className="text-xs text-slate-500 hover:text-blue-400 bg-slate-900 px-3 py-1 rounded"
              >
                Copy
              </button>
            </div>
            <pre className="text-sm font-mono text-blue-300 overflow-x-auto leading-relaxed">
              <code>{kerasCode}</code>
            </pre>
          </div>

          {trainResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  Training Complete
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
                  <p className="text-slate-500 text-sm mb-1">Test Accuracy</p>
                  <p className="text-3xl font-bold text-green-400">{(trainResult.test_accuracy * 100).toFixed(2)}%</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
                  <p className="text-slate-500 text-sm mb-1">Test Loss</p>
                  <p className="text-3xl font-bold text-slate-200">{trainResult.test_loss.toFixed(4)}</p>
                </div>
              </div>

              <div className="h-64 mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trainResult.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="epoch" stroke="#64748b" tick={{fill: '#64748b'}} />
                    <YAxis stroke="#64748b" tick={{fill: '#64748b'}} domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} name="Accuracy" />
                    {trainResult.chartData[0]?.val_accuracy && (
                       <Line type="monotone" dataKey="val_accuracy" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} name="Val Accuracy" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
