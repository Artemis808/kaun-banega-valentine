import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// --- CONTENT ---
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

// --- UTILS ---
const fadeOut = (audioRef, onComplete) => {
  if (!audioRef.current) return;
  const fadeAudio = setInterval(() => {
    if (audioRef.current.volume > 0.05) {
      audioRef.current.volume -= 0.05;
    } else {
      clearInterval(fadeAudio);
      audioRef.current.pause();
      audioRef.current.volume = 1; 
      if (onComplete) onComplete();
    }
  }, 50); 
};

export default function App() {
  const [stage, setStage] = useState("loading"); 
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [showStartBtn, setShowStartBtn] = useState(false);
  
  // Game State
  const [qIndex, setQIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [timer, setTimer] = useState(15);
  const [hearts, setHearts] = useState(0);
  const [displayHearts, setDisplayHearts] = useState(0);
  const [selected, setSelected] = useState(null);
  const [runaway, setRunaway] = useState({ x: 0, y: 0, scale: 1 });

  // Audio Refs
  const openingAudio = useRef(null);
  const questionAudio = useRef(null);
  const correctAudio = useRef(null);
  const finaleAudio = useRef(null);
  
  // NEW: Audio Haptic Ref
  const popAudio = useRef(null); 

  // --- INITIAL SETUP ---
  useEffect(() => {
    openingAudio.current = new Audio("/music/opening.mp3");
    questionAudio.current = new Audio("/music/question.mp3");
    correctAudio.current = new Audio("/music/correct.mp3");
    finaleAudio.current = new Audio("/music/finale.mp3");
    
    // NEW: "Pop" sound for haptic feel
    // You'll need a short 'pop.mp3' in your public/music folder
    popAudio.current = new Audio("/music/pop.mp3"); 

    questionAudio.current.loop = true;

    openingAudio.current.addEventListener("canplaythrough", () => {
      setIsAudioReady(true);
      setStage("lock");
    });
    
    setTimeout(() => {
      setIsAudioReady(true);
      setStage("lock");
    }, 3000);

    questions.forEach((q) => {
      const img = new Image();
      img.src = q.image;
    });

    return () => {
      [openingAudio, questionAudio, correctAudio, finaleAudio].forEach(ref => ref.current?.pause());
    };
  }, []);

  // --- ACTIONS ---

  // Custom Haptic Function
  const triggerHaptic = () => {
    // 1. Try native vibration (Android)
    if (navigator.vibrate) {
        navigator.vibrate(15); // Very short, sharp tick
    }
    
    // 2. Play silent "pop" for iOS (Audio Haptic)
    if (popAudio.current) {
        popAudio.current.volume = 0.5; // Not too loud, just felt
        popAudio.current.currentTime = 0;
        popAudio.current.play().catch(() => {});
    }
  };

  const handleUnlock = () => {
    triggerHaptic(); // Feedback on first tap
    setStage("intro");
    
    if (openingAudio.current) {
      openingAudio.current.volume = 0.7;
      openingAudio.current.play().catch(e => console.error(e));
    }

    setTimeout(() => setShowStartBtn(true), 4000);
  };

  const startQuiz = () => {
    triggerHaptic();
    fadeOut(openingAudio, () => {
      questionAudio.current.currentTime = 0;
      questionAudio.current.volume = 0.4;
      questionAudio.current.play();
    });
    setStage("quiz");
  };

  const selectAnswer = (i) => {
    triggerHaptic(); // Tactile feel on answer selection
    setSelected(i);
    
    correctAudio.current.currentTime = 0;
    correctAudio.current.play();

    setTimeout(() => {
      setRevealed(true);
      const percent = qIndex === 3 ? 69 : Math.round(((qIndex + 1) / 5) * 100);
      setHearts(percent);
      
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.3 } });

      if (questions[qIndex].finale) {
        questionAudio.current.pause();
        finaleAudio.current.currentTime = 0;
        finaleAudio.current.volume = 1;
        finaleAudio.current.play();
        confetti({ particleCount: 200, spread: 160, origin: { y: 0.6 } });
      }
    }, 800);
  };

  const nextQuestion = () => {
    triggerHaptic();
    setSelected(null);
    setRevealed(false);
    setQIndex(prev => prev + 1);
    setRunaway({ x: 0, y: 0, scale: 1 });
  };

  const restartGame = () => {
    triggerHaptic();
    fadeOut(finaleAudio);
    setStage("lock");
    setShowStartBtn(false);
    setQIndex(0);
    setHearts(0);
    setDisplayHearts(0);
    setSelected(null);
    setRevealed(false);
  };

  // --- TIMERS ---
  useEffect(() => {
    if (displayHearts === hearts) return;
    const interval = setInterval(() => {
      setDisplayHearts(p => (p < hearts ? p + 1 : hearts));
    }, 20);
    return () => clearInterval(interval);
  }, [hearts]);

  useEffect(() => {
    if (stage !== "quiz" || revealed) return;
    setTimer(15);
    const interval = setInterval(() => {
      setTimer(t => {
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

  // --- RENDER ---
  
  if (stage === "loading") {
    return <div style={styles.loader}><div style={styles.spinner}>❤️</div></div>;
  }

  if (stage === "lock") {
    return (
      <div style={styles.loader}>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={handleUnlock}
          style={{ cursor: "pointer", fontSize: 90 }}
          whileTap={{ scale: 0.8 }}
        >
          ❤️
        </motion.div>
        <p style={{ ...styles.text, marginTop: 20 }}>Tap heart to unlock</p>
      </div>
    );
  }

  if (stage === "intro") {
    return (
      <div style={styles.loader}>
        <motion.img
          src="/kbv-logo.png"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          style={{ width: "60%", maxWidth: 200 }}
        />
        
        <div style={{ height: 60, marginTop: 30 }}>
            {showStartBtn ? (
            <motion.button
                onClick={startQuiz}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.btn}
                whileTap={{ scale: 0.95 }}
            >
                Start The Journey ❤️
            </motion.button>
            ) : (
             <motion.p initial={{opacity:0}} animate={{opacity:0.7}} style={styles.text}>Loading memories...</motion.p>
            )}
        </div>
      </div>
    );
  }

  // QUIZ & FINALE
  return (
    <div style={styles.bg}>
      <div style={styles.statusBar}>
        <div style={styles.statusItem}>⏳ {timer}s</div>
        <div style={styles.statusItem}>❤️ {displayHearts}%</div>
      </div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key={`q-${qIndex}`}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            style={styles.card}
          >
            <h2 style={styles.question}>{questions[qIndex].question}</h2>
            
            <div style={styles.optionsGrid}>
                {questions[qIndex].options.map((opt, i) => {
                if (questions[qIndex].finale && i === 3) {
                    return (
                    <motion.button
                        key={i}
                        style={{...styles.option, background: "#ff4d4d", border: "none"}}
                        animate={runaway}
                        onMouseEnter={() => setRunaway({
                            x: Math.random() * 100 - 50, 
                            y: Math.random() * 100 - 50,
                            scale: 0.9
                        })}
                        onTouchStart={() => setRunaway({
                            x: Math.random() * 100 - 50, 
                            y: Math.random() * 100 - 50,
                            scale: 0.9
                        })}
                    >
                        {opt}
                    </motion.button>
                    );
                }
                return (
                    <motion.button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    style={{
                        ...styles.option,
                        ...(selected === i && questions[qIndex].correct.includes(i) ? styles.correct : {})
                    }}
                    whileTap={{ scale: 0.98 }}
                    >
                    {opt}
                    </motion.button>
                );
                })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`img-${qIndex}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.center}
          >
            <div style={styles.imageFrame}>
                <img src={questions[qIndex].image} style={styles.image} alt="Memory" />
            </div>

            {qIndex < questions.length - 1 ? (
              <button style={styles.btn} onClick={nextQuestion}>
                Next ❤️
              </button>
            ) : (
              <div style={{textAlign: "center", display: "flex", flexDirection: "column", gap: 20}}>
                <h1 style={styles.finalText}>
                  Happy Valentine’s Day <br /> My Forever Valentine
                </h1>
                <button style={styles.btn} onClick={restartGame}>
                  Play Again ❤️
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- STYLES (Unchanged from previous best version) ---
const styles = {
  loader: {
    height: "100vh",
    background: "#000",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
  },
  spinner: {
    fontSize: 40,
    animation: "spin 1s linear infinite",
  },
  bg: {
    minHeight: "100vh",
    width: "100%",
    background: "radial-gradient(circle at top center, #2e004f, #000 90%)",
    color: "white",
    padding: "80px 16px 40px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflowX: "hidden", 
  },
  statusBar: {
    position: "fixed",
    top: 10,
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
    maxWidth: 400,
    height: 50,
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: 30,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    zIndex: 100,
    border: "1px solid rgba(255,255,255,0.1)",
    boxSizing: "border-box",
  },
  statusItem: {
    fontWeight: "bold",
    fontSize: 16,
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },
  card: {
    width: "100%",
    maxWidth: 450,
    background: "rgba(20,20,20,0.8)",
    padding: 24,
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  },
  question: {
    fontSize: "clamp(1.1rem, 5vw, 1.4rem)",
    marginBottom: 24,
    lineHeight: 1.4,
    fontWeight: 600,
    textAlign: "center",
  },
  optionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  option: {
    padding: "16px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.2s",
    touchAction: "manipulation", 
  },
  correct: {
    background: "linear-gradient(90deg, #FFD700, #FFA500)",
    color: "black",
    fontWeight: "bold",
    border: "none",
    boxShadow: "0 0 15px rgba(255, 215, 0, 0.4)",
  },
  btn: {
    padding: "16px 40px",
    borderRadius: 50,
    border: "none",
    background: "white",
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(255,255,255,0.2)",
    touchAction: "manipulation",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  imageFrame: {
    padding: 10,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    marginBottom: 25,
  },
  image: {
    display: "block",
    maxWidth: "100%",
    maxHeight: "50vh",
    borderRadius: 16,
    objectFit: "cover",
  },
  text: {
    color: "#aaa",
    fontSize: 14,
  },
  finalText: {
    fontSize: "clamp(2rem, 8vw, 3rem)",
    background: "linear-gradient(to right, #FFD700, #FDB931)",
    WebkitBackgroundClip: "text",
    color: "transparent",
    fontWeight: 800,
    lineHeight: 1.1,
    textAlign: "center",
  },
};
