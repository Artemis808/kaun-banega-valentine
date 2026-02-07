import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// --- QUESTION DATA ---
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
      "Fasshun model", "Interior designer", "Personal chef 😛",
      "Artist", "Rider", "Dancer", "All of the above!"
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

// --- ANIMATION VARIANTS ---
const pulse = {
  animate: { scale: [1, 1.1, 1] },
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
};

export default function App() {
  const [stage, setStage] = useState("lock"); // lock -> intro -> quiz
  const [showStartBtn, setShowStartBtn] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [timer, setTimer] = useState(15);
  const [hearts, setHearts] = useState(0);
  const [displayHearts, setDisplayHearts] = useState(0);
  const [selected, setSelected] = useState(null);
  const [runaway, setRunaway] = useState({ x: 0, y: 0, scale: 1 });

  const openingAudio = useRef(null);
  const questionAudio = useRef(null);
  const correctAudio = useRef(null);
  const finaleAudio = useRef(null);
  const popAudio = useRef(null);

  useEffect(() => {
    openingAudio.current = new Audio("/music/opening.mp3");
    questionAudio.current = new Audio("/music/question.mp3");
    correctAudio.current = new Audio("/music/correct.mp3");
    finaleAudio.current = new Audio("/music/finale.mp3");
    popAudio.current = new Audio("/music/pop.mp3");

    questionAudio.current.loop = true;
    
    // Preload images
    questions.forEach(q => { const img = new Image(); img.src = q.image; });
  }, []);

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(15);
    if (popAudio.current) {
      popAudio.current.volume = 0.4;
      popAudio.current.currentTime = 0;
      popAudio.current.play().catch(() => {});
    }
  };

  const handleUnlock = () => {
    triggerHaptic();
    setStage("intro");
    openingAudio.current.volume = 0.7;
    openingAudio.current.play();
    setTimeout(() => setShowStartBtn(true), 4000);
  };

  const startQuiz = () => {
    triggerHaptic();
    openingAudio.current.pause();
    questionAudio.current.volume = 0.4;
    questionAudio.current.play();
    setStage("quiz");
  };

  const selectAnswer = (i) => {
    triggerHaptic();
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
    setQIndex(p => p + 1);
    setRunaway({ x: 0, y: 0, scale: 1 });
  };

  const moveNo = () => {
    setRunaway({
      x: Math.random() * 120 - 60,
      y: Math.random() * 120 - 60,
      scale: runaway.scale * 0.9
    });
  };

  // Counting Meter Logic
  useEffect(() => {
    if (displayHearts === hearts) return;
    const interval = setInterval(() => {
      setDisplayHearts(p => p < hearts ? p + 1 : hearts);
    }, 20);
    return () => clearInterval(interval);
  }, [hearts]);

  // Timer Logic
  useEffect(() => {
    if (stage !== "quiz" || revealed) return;
    setTimer(15);
    const interval = setInterval(() => {
      setTimer(t => (t <= 1 ? (setRevealed(true), 0) : t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [qIndex, stage, revealed]);

  // --- RENDERING ---

  if (stage === "lock") {
    return (
      <div style={styles.loader}>
        <motion.div 
          {...pulse} 
          onClick={handleUnlock} 
          style={{ cursor: "pointer", fontSize: 100 }}
          whileTap={{ scale: 0.8 }}
        >
          ❤️
        </motion.div>
        <p style={styles.subText}>Tap to start our story</p>
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
          style={{ width: 180 }} 
        />
        {showStartBtn ? (
          <motion.button 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={startQuiz} style={styles.btn}
          >
            Enter Experience ❤️
          </motion.button>
        ) : (
          <p style={styles.subText}>Cue the music...</p>
        )}
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      <div style={styles.statusBar}>
        <motion.div {...pulse} style={styles.statusItem}>⏳ {timer}s</motion.div>
        <motion.div {...pulse} style={styles.statusItem}>❤️ {displayHearts}%</motion.div>
      </div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div 
            key={qIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={styles.card}
          >
            <h2 style={styles.questionText}>{questions[qIndex].question}</h2>
            {questions[qIndex].options.map((opt, i) => {
              if (questions[qIndex].finale && i === 3) {
                return (
                  <motion.button 
                    key={i} animate={runaway} onMouseEnter={moveNo} onTouchStart={moveNo}
                    style={{...styles.option, background: "#ff4d4d", border: "none"}}
                  >
                    {opt}
                  </motion.button>
                );
              }
              return (
                <motion.button 
                  key={i} onClick={() => selectAnswer(i)}
                  whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.15)" }}
                  whileTap={{ scale: 0.98 }}
                  style={{...styles.option, ...(selected === i && questions[qIndex].correct.includes(i) ? styles.correct : {})}}
                >
                  {opt}
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.center}>
            <div style={styles.imgFrame}><img src={questions[qIndex].image} style={styles.img} alt="Memory" /></div>
            {qIndex < questions.length - 1 ? (
              <motion.button whileHover={{ scale: 1.05 }} onClick={nextQuestion} style={styles.btn}>Continue ❤️</motion.button>
            ) : (
              <div style={styles.finalCenter}>
                <h1 style={styles.finalText}>Happy Valentine’s Day <br/> To My Forever Partner ❤️</h1>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => setStage("lock")} style={styles.btn}>Replay ❤️</motion.button>
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
  loader: { height: "100vh", background: "black", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 20 },
  subText: { color: "rgba(255,255,255,0.6)", fontSize: 14, letterSpacing: 1 },
  bg: { minHeight: "100vh", background: "radial-gradient(circle at top, #1e003a, #000 80%)", color: "white", padding: "100px 20px 40px", display: "flex", flexDirection: "column", alignItems: "center" },
  statusBar: { position: "fixed", top: 15, width: "90%", maxWidth: 400, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", borderRadius: 30, padding: "10px 25px", display: "flex", justifyContent: "space-between", border: "1px solid rgba(255,255,255,0.1)", zIndex: 100 },
  statusItem: { fontWeight: "bold", fontSize: 16 },
  card: { width: "100%", maxWidth: 450, background: "rgba(255,255,255,0.05)", borderRadius: 24, padding: 25, border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" },
  questionText: { fontSize: "1.25rem", textAlign: "center", marginBottom: 25, lineHeight: 1.4 },
  option: { width: "100%", padding: 16, marginTop: 12, borderRadius: 15, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white", cursor: "pointer", textAlign: "left", fontSize: "1rem" },
  correct: { background: "linear-gradient(90deg, #FFD700, #FFA500)", color: "black", fontWeight: "bold", border: "none", boxShadow: "0 0 20px gold" },
  btn: { padding: "16px 40px", borderRadius: 50, border: "none", background: "white", color: "black", fontWeight: "bold", fontSize: 18, cursor: "pointer", marginTop: 20 },
  center: { display: "flex", flexDirection: "column", alignItems: "center", width: "100%" },
  imgFrame: { padding: 10, background: "rgba(255,255,255,0.1)", borderRadius: 20, marginBottom: 20 },
  img: { maxWidth: "100%", maxHeight: "45vh", borderRadius: 12, objectFit: "cover" },
  finalCenter: { textAlign: "center", display: "flex", flexDirection: "column", gap: 20 },
  finalText: { fontSize: "clamp(1.8rem, 7vw, 2.5rem)", background: "linear-gradient(to right, #FFD700, #fff0a8)", WebkitBackgroundClip: "text", color: "transparent", fontWeight: "900" }
};
