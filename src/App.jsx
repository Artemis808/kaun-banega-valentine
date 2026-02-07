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

// --- ANIMATION ---
const pulseAnim = {
  animate: { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] },
  transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
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

  const openingAudio = useRef(null);
  const questionAudio = useRef(null);
  const correctAudio = useRef(null);
  const finaleAudio = useRef(null);

  // AUDIO SAFE PLAY
  const safePlay = (audioRef, volume = 1) => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.volume = volume;
    audioRef.current.play().catch(() => {});
  };

  useEffect(() => {
    openingAudio.current = new Audio("/music/opening.mp3");
    questionAudio.current = new Audio("/music/question.mp3");
    correctAudio.current = new Audio("/music/correct.mp3");
    finaleAudio.current = new Audio("/music/finale.mp3");
    questionAudio.current.loop = true;
  }, []);

  const handleUnlock = () => {
    safePlay(openingAudio, 0.7);
    setStage("intro");
    setTimeout(() => setShowStartBtn(true), 3500);
  };

  const startQuiz = () => {
    openingAudio.current.pause();
    safePlay(questionAudio, 0.4);
    setStage("quiz");
  };

  const selectAnswer = (i) => {
    setSelected(i);
    safePlay(correctAudio, 0.8);

    setTimeout(() => {
      setRevealed(true);

      const percent = qIndex === 3 ? 69 : Math.round(((qIndex + 1) / 5) * 100);
      setHearts(percent);

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.3 } });

      if (questions[qIndex].finale) {
        questionAudio.current.pause();
        safePlay(finaleAudio, 0.9);

        confetti({
          particleCount: 220,
          spread: 160,
          origin: { y: 0.6 },
        });
      }
    }, 700);
  };

  const nextQuestion = () => {
    setSelected(null);
    setRevealed(false);
    setQIndex(p => p + 1);
  };

  const fullRestart = () => {
    openingAudio.current.pause();
    questionAudio.current.pause();
    finaleAudio.current.pause();

    setStage("lock");
    setShowStartBtn(false);
    setQIndex(0);
    setRevealed(false);
    setHearts(0);
    setDisplayHearts(0);
    setSelected(null);
  };

  // LOVE METER SMOOTH COUNT
  useEffect(() => {
    if (displayHearts === hearts) return;

    const interval = setInterval(() => {
      setDisplayHearts(prev => {
        if (prev >= hearts) {
          clearInterval(interval);
          return hearts;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [hearts]);

  // TIMER
  useEffect(() => {
    if (stage !== "quiz" || revealed) return;

    setTimer(15);

    const interval = setInterval(() => {
      setTimer(t => (t <= 1 ? (setRevealed(true), 0) : t - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [qIndex, stage, revealed]);

  // --- LOCK SCREEN ---
  if (stage === "lock") {
    return (
      <div style={styles.loader}>
        <motion.div
          {...pulseAnim}
          onClick={handleUnlock}
          style={{ cursor: "pointer", fontSize: 100 }}
          whileTap={{ scale: 0.85 }}
        >
          ❤️
        </motion.div>

        <p style={styles.subText}>Tap to Begin ❤️</p>
      </div>
    );
  }

  // --- INTRO ---
  if (stage === "intro") {
    return (
      <div style={styles.loader}>
        <motion.img
          src="/kbv-logo.png"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ width: 170 }}
        />

        {showStartBtn && (
          <button style={styles.btn} onClick={startQuiz}>
            Begin Experience ❤️
          </button>
        )}
      </div>
    );
  }

  // --- QUIZ ---
  return (
    <div style={styles.bg}>
      <div style={styles.statusBar}>
        <div style={{
          ...styles.statusItem,
          color: timer <= 5 ? "#ff4d4d" : "white"
        }}>
          ⏳ {timer}s
        </div>

        <motion.div {...pulseAnim} style={styles.statusItem}>
          ❤️ {displayHearts}% {displayHearts === 69 && "(nice)"}
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key={`q-${qIndex}`}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={styles.card}
          >
            <h2 style={styles.questionText}>
              {questions[qIndex].question}
            </h2>

            {questions[qIndex].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                style={{
                  ...styles.option,
                  ...(selected === i &&
                    questions[qIndex].correct.includes(i)
                    ? styles.correct
                    : {})
                }}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={`img-${qIndex}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.imageContainer}
          >
            <div style={styles.imgFrame}>
              <img
                src={questions[qIndex].image}
                style={styles.img}
                alt="Memory"
              />
            </div>

            {qIndex < questions.length - 1 ? (
              <button style={styles.btn} onClick={nextQuestion}>
                Next ❤️
              </button>
            ) : (
              <div style={styles.finalCenter}>
                <h1 style={styles.finalText}>
                  Happy Valentine’s Day  
                  <br />
                  My Forever ❤️
                </h1>

                <button style={styles.btn} onClick={fullRestart}>
                  Replay ❤️
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
    gap: 20,
  },

  subText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    letterSpacing: 1.5,
  },

  bg: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #1a0033, #000 90%)",
    color: "white",
    padding: "80px 15px 30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflowX: "hidden",
  },

  statusBar: {
    position: "fixed",
    top: 15,
    width: "90%",
    maxWidth: 380,
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(18px)",
    borderRadius: 40,
    padding: "10px 24px",
    display: "flex",
    justifyContent: "space-between",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  statusItem: {
    fontWeight: "bold",
    fontSize: 15,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 28,
    padding: 26,
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
  },

  questionText: {
    fontSize: "1.25rem",
    textAlign: "center",
    marginBottom: 20,
  },

  option: {
    width: "100%",
    padding: 16,
    marginTop: 10,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    cursor: "pointer",
  },

  correct: {
    background: "linear-gradient(90deg,#FFD700,#FFA500)",
    color: "black",
    fontWeight: "bold",
    border: "none",
  },

  btn: {
    padding: "16px 44px",
    borderRadius: 50,
    border: "none",
    background: "white",
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    marginTop: 15,
  },

  imageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "95vw",
  },

  imgFrame: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginBottom: 18,
    padding: 6,
    borderRadius: 26,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  img: {
    width: "auto",
    height: "auto",
    maxWidth: "92vw",
    maxHeight: "78vh",
    objectFit: "contain",
    borderRadius: 22,
  },

  finalCenter: {
    textAlign: "center",
  },

  finalText: {
    fontSize: "clamp(1.5rem, 6vw, 2.4rem)",
    background: "linear-gradient(to bottom,#FFD700,#fff0a8)",
    WebkitBackgroundClip: "text",
    color: "transparent",
    fontWeight: "900",
  },
};
