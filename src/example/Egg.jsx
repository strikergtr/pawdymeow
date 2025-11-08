import React, { useState, useEffect, useRef } from "react";

const alarmAudio = "https://s3.amazonaws.com/freecodecamp/drums/Give_us_a_light.mp3";

const eggTypes = [
  { name: 'ไข่ลวก', time: 180, description: 'ไข่ขาวเริ่มสุกแต่ยังนิ่ม, ไข่แดงยังเหลว' },
  { name: 'ไข่ยางมะตูม', time: 300, description: 'ไข่ขาวสุก, ไข่แดงเป็นลาวา' },
  { name: 'ไข่ต้ม', time: 600, description: 'ไข่แดงสุกทั้งหมด แต่ยังไม่แข็งจนเกินไป' },
  { name: 'ไข่ต้มสุก', time: 780, description: 'ไข่แดงสุกและแข็งทั้งหมด' },
];

export default function Egg() {

  const [selectedEgg, setSelectedEgg] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    let intervalId;
    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (audioRef.current) {
        audioRef.current.play();
      }
    }
    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft]);

  const handleStart = (egg) => {
    setSelectedEgg(egg);
    setTimeLeft(egg.time);
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedEgg ? selectedEgg.time : 0);
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
      <div className="min-h-screen w-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 w-full max-w-2xl">
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
            เครื่องจับเวลาต้มไข่
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* พื้นที่ต้มใข่ */}
            {eggTypes.map((egg) => (
              <button
                key={egg.name}
                onClick={() => handleStart(egg)}
                disabled={isRunning}
                className={`p-4 rounded-xl shadow-lg transition-transform transform hover:scale-105 active:scale-95
                  ${
                    selectedEgg?.name === egg.name
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <h2 className="font-bold text-lg mb-1">{egg.name}</h2>
                <p className="text-sm">{egg.description}</p>
              </button>
            ))}
          </div>

          {selectedEgg && (
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-700">
                คุณกำลังต้ม: {selectedEgg.name}
              </h3>
              <p className="text-gray-500 mb-4">{selectedEgg.description}</p>
              <div className="my-8">
                <span className="text-7xl font-mono text-gray-900 font-bold">
                  {formatTime(timeLeft)}
                </span>
              </div>

              <div className="flex justify-center space-x-4">
                {isRunning ? (
                  <button
                    onClick={handleStop}
                    className="bg-red-500 text-white px-6 py-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  >
                    หยุด
                  </button>
                ) : (
                  <button
                    onClick={() => handleStart(selectedEgg)}
                    className="bg-green-500 text-white px-6 py-2 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                  >
                    เริ่ม
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="bg-gray-500 text-white px-6 py-2 rounded-full shadow-lg hover:bg-gray-600 transition-colors"
                >
                  รีเซ็ต
                </button>
              </div>
            </div>
          )}

          <audio ref={audioRef} src={alarmAudio} preload="auto" />
        </div>
      </div>
  );
}
