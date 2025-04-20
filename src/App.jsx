import { useState, useEffect, useRef } from "react";

export default function QuittrApp() {
  const [trackers, setTrackers] = useState(() => {
    const saved = localStorage.getItem("trackers");
    return saved ? JSON.parse(saved) : [];
  });
  const [newGoal, setNewGoal] = useState("");
  const [isMeditating, setIsMeditating] = useState(false);
  const [meditateSeconds, setMeditateSeconds] = useState(5 * 60);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("trackers", JSON.stringify(trackers));
  }, [trackers]);

  const handleAddTracker = () => {
    if (!newGoal.trim()) return;
    const now = new Date();
    const newTracker = {
      id: Date.now(),
      goal: newGoal.trim(),
      startDate: now.toISOString(),
    };
    setTrackers((prev) => [...prev, newTracker]);
    setNewGoal("");
  };

  const handleResetTracker = (id) => {
    setTrackers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, startDate: new Date().toISOString() } : t
      )
    );
  };

  const handleDeleteTracker = (id) => {
    const tracker = trackers.find(t => t.id === id);
    const confirmed = window.confirm(`Are you sure you want to delete the tracker: "${tracker.goal}"?`);
    if (confirmed) {
      setTrackers((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const getTimeString = (startDate) => {
    const now = new Date();
    const date = new Date(startDate);
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const handleMeditate = async () => {
    setIsMeditating(true);
    setMeditateSeconds(5 * 60);
    try {
      audioRef.current.volume = 0.4;
      await audioRef.current.play();
    } catch (e) {
      console.log("Autoplay blocked. Waiting for user interaction.");
    }
    intervalRef.current = setInterval(() => {
      setMeditateSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsMeditating(false);
          if (audioRef.current) audioRef.current.pause();
          alert("Meditation complete. Great job staying focused.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 text-white flex flex-col items-center justify-start p-6">
      <h1 className="text-3xl font-bold mb-6 tracking-wide uppercase">Quittr</h1>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src="calm-waves-soft-rain-ambient-sound.mp3"
      />

      <div className="w-full max-w-5xl mb-6">
        <h2 className="text-lg font-semibold mb-4">What are you trying to quit or track?</h2>
        <div className="flex gap-4">
          <input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="e.g. Smoking, Sugar, Procrastination"
            className="flex-grow rounded px-3 py-2 text-black"
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
            onClick={handleAddTracker}
          >
            Add Tracker
          </button>
        </div>
      </div>

      <div className="bg-indigo-950/40 backdrop-blur-lg rounded-xl p-6 w-full max-w-5xl text-center shadow-xl">
        {trackers.length > 0 ? (
          <div className="flex overflow-x-auto space-x-6 pb-4">
            {trackers.map((tracker) => (
              <div key={tracker.id} className="bg-indigo-800/30 rounded-lg p-4 min-w-[240px] shadow shrink-0 relative">
                <button
                  onClick={() => handleDeleteTracker(tracker.id)}
                  className="absolute top-2 right-2 text-sm text-white bg-red-500 rounded-full px-2 py-0.5 hover:bg-red-600"
                >
                  ✕
                </button>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 animate-pulse shadow-2xl ring-4 ring-cyan-300/40 hover:scale-105 transition-transform" />
                <p className="text-sm">Tracking: <span className="font-semibold">{tracker.goal}</span></p>
                <h2 className="text-2xl font-bold mb-1">{getTimeString(tracker.startDate).split(" ")[0]}</h2>
                <p>{getTimeString(tracker.startDate).split(" ").slice(1).join(" ")}</p>
                <div className="mt-4 flex flex-col space-y-2">
                  <button className="bg-indigo-600 px-4 py-1 rounded text-sm hover:bg-indigo-700">Pledge</button>
                  <button
                    className="bg-indigo-600 px-4 py-1 rounded text-sm hover:bg-indigo-700"
                    onClick={handleMeditate}
                    disabled={isMeditating}
                  >
                    {isMeditating ? "Meditating..." : "Meditate"}
                  </button>
                  <button
                    className="bg-red-500 px-4 py-1 rounded text-sm hover:bg-red-600"
                    onClick={() => handleResetTracker(tracker.id)}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-300">No trackers yet. Add one above.</p>
        )}

        {isMeditating && (
          <p className="mt-6 text-yellow-300 font-mono text-lg">
            Meditating: {formatTime(meditateSeconds)}
          </p>
        )}
      </div>
    </div>
  );
}
