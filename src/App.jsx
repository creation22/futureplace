import { useState, useMemo } from 'react';
import { WorldMap } from './components/WorldMap';
import { questions, cityData, initialValidCities } from './data/gameData';

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [validCities, setValidCities] = useState(initialValidCities);
  const [history, setHistory] = useState([]);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost, finished

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (value, label) => {
    const attributeKey = currentQuestion.id;

    // Filter cities
    const nextValidCities = validCities.filter(cityId => {
      const city = cityData[cityId];
      if (!city) return false;
      return city[attributeKey] === value;
    });

    setValidCities(nextValidCities);
    setHistory([...history, { question: currentQuestion.text, answer: label, count: nextValidCities.length }]);

    // Check game over conditions
    if (nextValidCities.length === 1) {
      setGameState('won');
    } else if (nextValidCities.length === 0) {
      setGameState('lost');
    } else if (currentQuestionIndex >= questions.length - 1) {
      // Ran out of questions but multiple remain
      setGameState('finished');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setValidCities(initialValidCities);
    setHistory([]);
    setGameState('playing');
  };

  const remainingDetails = useMemo(() => {
    return validCities.map(c => `${cityData[c]?.name}, ${cityData[c]?.country}`).join(" • ");
  }, [validCities]);

  const remainingList = useMemo(() => {
    return validCities.map(c => cityData[c]);
  }, [validCities]);

  return (
    <div className="relative w-full h-screen bg-yellow-300 overflow-hidden flex flex-col md:flex-row font-mono">

      {/* Sidebar / HUD - Neo-Brutalism */}
      <div className="md:w-80 w-full bg-white border-r-4 border-black p-6 flex flex-col z-10 shrink-0 h-auto md:h-full max-h-[30vh] md:max-h-full overflow-y-auto">
        <h1 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">🌍 Find My City</h1>
        <p className="text-black font-mono text-sm mb-6 bg-yellow-300 inline-block px-2 border-2 border-black">World Elimination Map</p>

        <div className="mb-6 p-4 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-xs uppercase tracking-widest text-black mb-2 font-bold font-mono">Status</div>
          <div className="text-5xl font-black text-black mb-1">{validCities.length}</div>
          <div className="text-sm text-black font-bold">Cities Remaining</div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
          <div className="text-xs uppercase tracking-widest text-black mb-2 font-black border-b-4 border-black pb-1">Elimination Log</div>
          {history.map((step, i) => (
            <div key={i} className="border-4 border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="text-xs text-black font-mono font-bold uppercase mb-1">{step.question}</div>
              <div className="text-black text-lg font-black bg-lime-300 inline-block px-1 border-2 border-black mb-1">{step.answer}</div>
              <div className="text-xs text-black font-bold text-right">{step.count} left</div>
            </div>
          ))}
          {history.length === 0 && <div className="text-black font-mono text-sm border-2 border-dashed border-black p-2">Waiting for input...</div>}
        </div>

        {/* Show remaining cities if small enough */}
        {validCities.length <= 15 && validCities.length > 1 && (
          <div className="mt-4 p-3 bg-white border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-40 overflow-y-auto">
            <span className="font-black text-black block mb-2 uppercase border-b-2 border-black">Candidates:</span>
            {remainingList.map((city, i) => (
              <div key={i} className="py-1 border-b border-black last:border-0 flex justify-between font-mono text-sm">
                <span className="text-black font-bold">{city?.name}</span>
                <span className="text-black">{city?.country}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Map Area */}
      <div className="relative flex-1 bg-yellow-300 h-full border-t-4 md:border-t-0 md:border-l-0 border-black">
        <WorldMap validCities={validCities} cityData={cityData} />

        {/* Overlay Question Panel - Neo-Brutalism */}
        {gameState === 'playing' && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-white border-4 border-black p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] z-[1000]">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-black text-black mb-8 uppercase tracking-tight">{currentQuestion.text}</h2>
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value, opt.label)}
                    className="group relative px-4 py-4 bg-white hover:bg-lime-300 text-black transition-all duration-0 font-bold text-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                  >
                    <span className="relative z-10 font-mono uppercase">{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-mono text-black font-bold uppercase tracking-widest border-t-4 border-black pt-4">
                <span className="bg-black text-white px-2 py-1">STEP {currentQuestionIndex + 1}/{questions.length}</span>
                <span className="bg-black text-white px-2 py-1">{validCities.length} REMAINING</span>
              </div>
            </div>
          </div>
        )}

        {/* Game Over States - Neo-Brutalism */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-yellow-300/90 z-[2000] flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black p-10 max-w-lg w-full text-center shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
              {gameState === 'won' && (
                <>
                  <div className="text-8xl mb-6">📍</div>
                  <h2 className="text-4xl font-black text-black mb-2 uppercase">Target Acquired</h2>
                  <p className="text-black font-mono mb-8 border-b-4 border-black inline-block">OPTIMAL LOCATION IDENTIFIED</p>
                  <div className="mb-10 p-6 bg-lime-300 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-5xl font-black text-black mb-2 tracking-tighter">
                      {cityData[validCities[0]]?.name}
                    </div>
                    <div className="text-2xl text-black font-bold uppercase font-mono">
                      {cityData[validCities[0]]?.country}
                    </div>
                  </div>
                </>
              )}

              {gameState === 'finished' && (
                <>
                  <div className="text-6xl mb-4">🌍</div>
                  <h2 className="text-3xl font-black text-black mb-2 uppercase">Analysis Complete</h2>
                  <p className="text-black font-mono mb-4">REGION NARROWED TO {validCities.length} TARGETS</p>
                  <div className="mb-8 max-h-60 overflow-y-auto p-4 bg-white border-4 border-black text-left font-mono">
                    {remainingList.map((city, i) => (
                      <div key={i} className="py-2 border-b-2 border-dashed border-black last:border-0 flex justify-between">
                        <span className="text-black font-bold uppercase">{city?.name}</span>
                        <span className="text-black">{city?.country}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {gameState === 'lost' && (
                <>
                  <div className="text-8xl mb-4">❌</div>
                  <h2 className="text-4xl font-black text-black mb-2 uppercase">System Error</h2>
                  <p className="text-black font-bold mb-6 bg-red-400 border-2 border-black p-2 inline-block">NO MATCHING DATA FOUND</p>
                  <p className="text-black font-mono mb-8">Your specific criteria yielded zero results in our database.</p>
                </>
              )}

              <button
                onClick={resetGame}
                className="w-full py-4 bg-black text-white font-black text-xl hover:bg-white hover:text-black border-4 border-black transition-all shadow-[8px_8px_0px_0px_#84cc16] hover:shadow-[4px_4px_0px_0px_#84cc16] hover:translate-x-[4px] hover:translate-y-[4px] uppercase tracking-widest"
              >
                Reset System
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
