import React, { useEffect, useState, useRef } from "react";
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
      "Fasshun model and trend setter", "Interior designer", "Personal chef 😛",
      "Artist", "I'm a riderrr", "Dancer", "All of the above!"
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
const pulseAnim = {
  animate: { 
    scale: [1, 1.15, 1],
    opacity: [0.8, 1, 0.8]
  },
  transition: { 
    duration: 1.5, 
    repeat: Infinity, 
    ease: "easeInOut" 
  }
};
const glowVariants = {
  hover: { scale: 1.02, filter: "brightness(1.2) drop-shadow(0 0 12px rgba(255, 215, 0, 0.6))" },
  tap: { scale: 0.98, filter: "brightness(1.5) drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))" }
};
export default function App() {
  const [stage, setStage] = useState("lock"); 
  const [showStartBtn, setShowStartBtn] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [timer, setTimer] = useState(15);
  const [hearts, setHearts] = useState(0);
  const [displayHearts, setDisplayHearts] = useState(0);
  const [selected, setSelected] = useState(null);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0, scale: 1 });
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
  }, []);
  const stopAllAudio = () => {
    [openingAudio, questionAudio, correctAudio, finaleAudio].forEach(ref => {
      if (ref.current) { ref.current.pause(); ref.current.currentTime = 0; }
    });
  };
  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(15);
    if (popAudio.current) {
      popAudio.current.volume = 0.3;
      popAudio.current.currentTime = 0;
      popAudio.current.play().catch(() => {});
    }
  };
  const moveNoButton = () => {
    const randomX = (Math.random() - 0.5) * 320;
    const randomY = (Math.random() - 0.5) * 320;
    setNoButtonPos(prev => ({ 
      x: randomX, 
      y: randomY,
      scale: Math.max(0.3, (prev.scale || 1) - 0.15)
    }));
  };
  const handleUnlock = () => {
    triggerHaptic();
    setStage("intro");
    openingAudio.current?.play();
    setTimeout(() => setShowStartBtn(true), 4000);
  };
  const startQuiz = () => {
    triggerHaptic();
    openingAudio.current?.pause();
    questionAudio.current.volume = 0.4;
    questionAudio.current?.play();
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
        questionAudio.current?.pause();
        finaleAudio.current.volume = 0.8;
        finaleAudio.current?.play();
        confetti({ particleCount: 200, spread: 160, origin: { y: 0.6 } });
      }
    }, 800);
  };
  const fullRestart = () => {
    triggerHaptic();
    stopAllAudio();
    setStage("lock");
    setQIndex(0);
    setRevealed(false);
    setHearts(0);
    setDisplayHearts(0);
    setSelected(null);
    setNoButtonPos({ x: 0, y: 0, scale: 1 });
  };
  useEffect(() => {
    if (displayHearts === hearts) return;
    const interval = setInterval(() => {
      setDisplayHearts(p => p < hearts ? p + 1 : (clearInterval(interval), hearts));
    }, 25);
    return () => clearInterval(interval);
  }, [hearts]);
  useEffect(() => {
    if (stage !== "quiz" || revealed) return;
    setTimer(15);
    const interval = setInterval(() => {
      setTimer(t => (t <= 1 ? (setRevealed(true), 0) : t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [qIndex, stage, revealed]);
  if (stage === "lock") {
    return (
      <div style={styles.loader}>
        <motion.div {...pulseAnim} onClick={handleUnlock} style={{ cursor: "pointer", fontSize: 100 }} whileTap={{ scale: 0.8 }}>❤️</motion.div>
        <p style={styles.subText}>Touch to Begin</p>
      </div>
    );
  }
  if (stage === "intro") {
    return (
      <div style={styles.loader}>
        <motion.img src="/kbv-logo.png" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ width: 160 }} />
        {showStartBtn ? (
          <motion.button whileHover="hover" whileTap="tap" variants={glowVariants} onClick={startQuiz} style={styles.btn}>Begin ❤️</motion.button>
        ) : (
          <p style={styles.subText}>Setting the mood...</p>
        )}
      </div>
    );
  }
  return (
    <div style={styles.bg}>
      <div style={styles.statusBar}>
        <div style={styles.statusItem}>⏳ {timer}s</div>
        <motion.div {...pulseAnim} style={{...styles.statusItem, color: '#ff4d4d'}}>
           ❤️ {displayHearts}% {displayHearts === 69 && <span style={styles.niceText}>(nice)</span>}
        </motion.div>
      </div>
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div key={`q-${qIndex}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.card}>
            <h2 style={styles.questionText}>{questions[qIndex].question}</h2>
            {questions[qIndex].options.map((opt, i) => {
              if (questions[qIndex].finale && i === 3) {
                return (
                  <motion.button
                    key={i}
                    animate={{
                      x: noButtonPos.x,
                      y: noButtonPos.y,
                      scale: noButtonPos.scale
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 18
                    }}
                    variants={glowVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={(e) => {
                      e.preventDefault();
                      moveNoButton();
                    }}
                    onMouseEnter={moveNoButton}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      moveNoButton();
                    }}
                    style={{
                      ...styles.option,
                      background: 'rgba(255, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 0, 0, 0.4)',
                      color: '#ff6b6b',
                      position: 'relative'
                    }}
                  >
                    {opt}
                  </motion.button>
                );
              }
              return (
                <motion.button
                  key={i}
                  variants={glowVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => selectAnswer(i)}
                  style={{
                      ...styles.option,
                      ...(selected === i && questions[qIndex].correct.includes(i) ? styles.correct : {})
                  }}
                >
                  {opt}
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key={`img-${qIndex}`} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={styles.imageContainer}>
            <div style={styles.imgFrame}>
                <img src={questions[qIndex].image} style={styles.img} alt="Memory" />
            </div>
            
            {qIndex < questions.length - 1 ? (
              <motion.button variants={glowVariants} whileHover="hover" whileTap="tap" onClick={() => {triggerHaptic(); setRevealed(false); setQIndex(p=>p+1); setSelected(null);}} style={styles.btn}>Next ❤️</motion.button>
            ) : (
              <div style={styles.finalCenter}>
                <h1 style={styles.finalText}>Happy Valentine's Day My Forever ❤️</h1>
                <motion.button variants={glowVariants} whileHover="hover" whileTap="tap" onClick={fullRestart} style={styles.btn}>Replay ❤️</motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
