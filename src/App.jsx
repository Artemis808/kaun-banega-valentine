import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const questions = [
  {
    question: "What is Sarangae and why is stuck in my mind from my first impression of you?",
    options: ["BTS for the win!", "Saran-gayyyy", "Both b and c", "I love you bb"],
    correct: [3],
    image: "/kbv-images/1.jpg",
  },
  {
    question: "What was technically the first meal you made for me?",
    options: ["You is a snacc", "Bheja fryyy", "Pepper Chicken", "Poha with veggies"],
    correct: [2],
    image: "/kbv-images/2.jpg",
  },
  {
    question: "If not for your current job, which job would you be perfect for?",
    options: [
      "Fasshun model",
      "Interior designer",
      "Personal chef 😛",
      "Artist",
      "Rider",
      "Dancer",
      "All of the above!",
    ],
    correct: [6],
    image: "/kbv-images/3.jpg",
  },
  {
    question: "At what moment did I realize my life had quietly changed forever?",
    options: ["Kantara Day", "All the 11:11s", "Cubbon park", "Our first 31/12"],
    correct: [0, 1, 2, 3],
    image: "/kbv-images/4.jpg",
  },
  {
    question: "Will you be my valentine? Now and forever?",
    options: ["Yes", "Also Yes", "Both a and b", "No ☹"],
    correct: [0, 1, 2],
    image: "/kbv-images/5.jpg",
    finale: true,
  },
];

export default function App() {
  // STAGES: "lock" -> "intro" -> "quiz" -> "finale"
  const [stage, setStage] = useState("lock"); 
  const [showStartBtn, setShowStartBtn] = useState(false); // Delays the button
  
  // QUIZ STATE
  const [qIndex, setQIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [timer, setTimer] = useState(15);
  const [hearts, setHearts] = useState(0);
  const [displayHearts, setDisplayHearts] = useState(0);
  const [selected, setSelected] = useState(null);
  const [runaway, setRunaway] = useState({ x: 0, y: 0, scale: 1 });

  // AUDIO REFS
  const openingAudio = useRef(null);
  const questionAudio = useRef(null);
  const correctAudio = useRef(null);
  const finaleAudio = useRef(null);

  useEffect(() => {
    openingAudio.current = new Audio("/music/opening.mp3");
    questionAudio.current = new Audio("/music/question.mp3");
    correctAudio.current = new Audio("/music/correct.mp3");
    finaleAudio.current = new Audio("/music/finale.mp3");

    questionAudio.current.loop = true; // Loop the thinking music
    
    // Preload Images
    questions.forEach((q) => {
      const img = new Image();
      img.src = q.image;
    });

    return () => stopAllAudio();
  }, []);

  const stopAllAudio = () => {
    [openingAudio, questionAudio, correctAudio, finaleAudio].forEach((ref) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
  };

  // 1. UNLOCK AUDIO (User Clicks Heart)
  const handleUnlock = () => {
    setStage("intro");
    
    // Play Opening Music Immediately
    if (openingAudio.current) {
      openingAudio.current.volume = 0.7;
      openingAudio.current.play().catch((e) => console.log("Audio Error:", e));
    }

    // Wait 4 seconds before even showing the "Enter Experience" button
    // This forces the user to listen to the intro song for a bit.
    setTimeout(() => {
      setShowStartBtn(true);
    }, 4000); 
  };

  // 2. START QUIZ (User Clicks Button)
  const startQuiz = () => {
    // FADE OUT OPENING? Or just stop it. Let's stop it for safety.
    if (openingAudio.current) {
      openingAudio.current.pause(); 
    }

    // Start Question Music
    if (questionAudio.current) {
      questionAudio.current.volume = 0.4;
      questionAudio.current.currentTime = 0;
      questionAudio.current.play();
    }

    setStage("quiz");
  };

  const selectAnswer = (i) => {
    setSelected(i);
    correctAudio.current.currentTime = 0;
    correctAudio.current.play();

    setTimeout(() => {
      setRevealed(true);
      const percent = qIndex === 3 ? 69 : Math.round(((qIndex + 1) / 5) * 100);
      setHearts(percent);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.2 } });

      if (questions[qIndex].finale) {
        // Stop Loop, Play Finale
        questionAudio.current.pause();
        finaleAudio.current.currentTime = 0;
        finaleAudio.current.volume = 0.8;
        finaleAudio.current.play();
        confetti({ particleCount: 220, spread: 140, origin: { y: 0.6 } });
      }
    }, 900);
  };

  const nextQuestion = () => {
    setSelected(null);
    setRevealed(false);
    setQIndex((prev) => prev + 1);
    setRunaway({ x: 0, y: 0, scale: 1 });
  };

  const restartGame = () => {
    stopAllAudio();
    setStage("lock"); // Go back to very start
    setShowStartBtn(false);
    setQIndex(0);
    setHearts(0);
    setDisplayHearts(0);
    setSelected(null);
    setRevealed(false);
  };

  // Love Meter Logic
  useEffect(() => {
    if (displayHearts === hearts) return;
    const interval = setInterval(() => {
      setDisplayHearts((p) => (p < hearts ? p + 1 : hearts));
    }, 20);
    return () => clearInterval(interval);
  }, [hearts]);

  // Timer Logic
  useEffect(() => {
    if (stage !== "quiz" || revealed) return;
    setTimer(15);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setRevealed(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qIndex, stage, revealed]);

  // --- RENDER STAGES ---

  // STAGE 1: LOCK SCREEN (Silent)
  if (stage === "lock") {
    return (
      <div style={styles.loader}>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={handleUnlock}
          style={{ cursor: "pointer", fontSize: 100 }}
        >
          ❤️
        </motion.div>
        <p style={{ color: "white", opacity: 0.7, fontSize: 16 }}>Tap to unlock sound</p>
      </div>
    );
  }

  // STAGE 2: CINEMATIC INTRO (Opening Music Playing)
  if (stage === "intro") {
    return (
      <div style={styles.loader}>
        <motion.img
          src="/kbv-logo.png"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          style={{ width: 200 }}
        />
        
        {/* Helper Text while waiting */}
        {!showStartBtn && (
            <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 0.6 }} 
                transition={{ delay: 1 }}
                style={{ color: "white", marginTop: 20 }}
            >
                Loading memories...
            </motion.p>
        )}

        {/* Button only appears after 4 seconds */}
        {showStartBtn && (
          <motion.button
            onClick={startQuiz}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.beginBtn}
            whileHover={{ scale: 1.05 }}
          >
            Let's Begin ❤️
          </motion.button>
        )}
      </div>
    );
  }

  // STAGE 3: QUIZ (Question Music Playing)
  return (
    <div style={styles.bg}>
      {questions[qIndex].finale && !revealed && <div style={styles.spotlight} />}
      
      <div style={styles.topBar}>
        <div style={styles.timer}>⏳ {timer}</div>
        <motion.div style={styles.heartMeter}>
          ❤️ {displayHearts}% {displayHearts === 69 && "(nice)"}
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={styles.card}
          >
            <h2 style={styles.questionText}>{questions[qIndex].question}</h2>
            {questions[qIndex].options.map((opt, i) => {
              // Runaway Button Logic
              if (questions[qIndex].finale && i === 3) {
                return (
                  <motion.button
                    key={i}
                    style={styles.no}
                    animate={runaway}
                    onMouseEnter={() => setRunaway({
                      x: Math.random() * 200 - 100,
                      y: Math.random() * 150 - 75,
                      scale: 0.9 
                    })}
                  >
                    {opt}
                  </motion.button>
                );
              }
              // Normal Buttons
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  style={{
                    ...styles.option,
                    ...(selected === i && questions[qIndex].correct.includes(i) && styles.correctSelected),
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.center}
          >
            <img src={questions[qIndex].image} style={styles.image} alt="Memory" />
            
            {qIndex < questions.length - 1 ? (
              <button style={styles.beginBtn} onClick={nextQuestion}>
                Continue ❤️
              </button>
            ) : (
              <div style={styles.finalWrapper}>
                <h1 style={styles.finalText}>
                  ❤️ Happy Valentine’s Day <br /> To My Forever Valentine ❤️
                </h1>
                <button style={styles.beginBtn} onClick={restartGame}>
                  Back to Start ❤️
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- STYLES ---
const styles = {
  loader: {
    height: "100vh",
    background: "black",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
  },
  bg: {
    minHeight: "100vh",
    background: "radial-gradient(circle at center, #14003a, #060012 60%, black)",
    color: "white",
    padding: "100px 20px 40px",
  },
  topBar: {
    position: "absolute",
    top: 30,
    left: 20,
    right: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  heartMeter: { fontSize: "1.2rem", fontWeight: "bold" },
  timer: { fontSize: "1.2rem", fontWeight: "bold" },
  spotlight: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(circle at center, transparent 150px, rgba(0,0,0,0.95))",
    pointerEvents: "none",
    zIndex: 5,
  },
  card: {
    maxWidth: 500,
    margin: "auto",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    padding: 25,
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.1)",
    position: "relative",
    zIndex: 10,
  },
  questionText: {
    fontSize: "1.3rem",
    marginBottom: 25,
    lineHeight: 1.4,
    textAlign: "center",
  },
  option: {
    width: "100%",
    padding: 16,
    marginTop: 12,
    borderRadius: 15,
    border: "none",
    cursor: "pointer",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    fontSize: "1rem",
    transition: "0.2s",
  },
  correctSelected: {
    background: "linear-gradient(45deg,#FFD700,#fff0a8)",
    color: "black",
    fontWeight: "bold",
    boxShadow: "0 0 25px gold",
  },
  no: {
    padding: 14,
    marginTop: 12,
    borderRadius: 12,
    border: "none",
    background: "#ff4d4d",
    color: "white",
    cursor: "pointer",
  },
  beginBtn: {
    padding: "16px 35px",
    borderRadius: 50,
    border: "none",
    cursor: "pointer",
    background: "white",
    color: "black",
    fontWeight: "bold",
    fontSize: "1.1rem",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    textAlign: "center",
  },
  image: {
    maxWidth: "88vw",
    maxHeight: "45vh",
    borderRadius: 20,
    boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
    objectFit: "cover",
  },
  finalWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 30,
  },
  finalText: {
    fontSize: "clamp(22px, 5.5vw, 32px)",
    textAlign: "center",
    lineHeight: 1.2,
    background: "linear-gradient(45deg,#FFD700,#fff0a8)",
    WebkitBackgroundClip: "text",
    color: "transparent",
    fontWeight: "900",
    padding: "0 10px",
  },
};
