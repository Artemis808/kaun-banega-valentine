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
  const [interacted, setInteracted] = useState(false); // New state for audio unlock
  const [started, setStarted] = useState(false);
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

  const q = questions[qIndex];

  // PRELOAD ASSETS
  useEffect(() => {
    questions.forEach((q) => {
      const img = new Image();
      img.src = q.image;
    });

    openingAudio.current = new Audio("/music/opening.mp3");
    questionAudio.current = new Audio("/music/question.mp3");
    correctAudio.current = new Audio("/music/correct.mp3");
    finaleAudio.current = new Audio("/music/finale.mp3");

    questionAudio.current.loop = true;
  }, []);

  // LOVE METER SMOOTH COUNT
  useEffect(() => {
    if (displayHearts === hearts) return;
    const interval = setInterval(() => {
      setDisplayHearts((prev) => {
        if (prev >= hearts) {
          clearInterval(interval);
          return hearts;
        }
        return prev + 1;
      });
    }, 18);
    return () => clearInterval(interval);
  }, [hearts]);

  // TIMER
  useEffect(() => {
    if (!started || revealed) return;
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
  }, [qIndex, started, revealed]);

  // PHASE 1: UNLOCK AUDIO
  const handleInteraction = () => {
    setInteracted(true);
    // Play & Pause immediately to "unlock" the audio context
    openingAudio.current.play().then(() => {
        openingAudio.current.pause();
        openingAudio.current.currentTime = 0;
    }).catch(e => console.log("Audio play blocked", e));
  };

  // PHASE 2: START EXPERIENCE
  const startGame = async () => {
    try {
      openingAudio.current.volume = 0.6;
      await openingAudio.current.play();

      setTimeout(() => {
        questionAudio.current.volume = 0.35;
        questionAudio.current.play();
      }, 2500);

      setStarted(true);
    } catch {
      setStarted(true);
    }
  };

  const selectAnswer = (i) => {
    setSelected(i);
    correctAudio.current.play();

    setTimeout(() => {
      setRevealed(true);
      const percent = qIndex === 3 ? 69 : Math.round(((qIndex + 1) / 5) * 100);
      setHearts(percent);

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.2 },
      });

      if (q.finale) {
        questionAudio.current.pause();
        finaleAudio.current.play();
        confetti({
          particleCount: 220,
          spread: 140,
          origin: { y: 0.6 },
        });
      }
    }, 900);
  };

  const next = () => {
    setSelected(null);
    setRevealed(false);
    setQIndex((p) => p + 1);
    setRunaway({ x: 0, y: 0, scale: 1 });
  };

  const restartGame = () => {
    finaleAudio.current?.pause();
    questionAudio.current?.pause();
    if (finaleAudio.current) finaleAudio.current.currentTime = 0;
    if (questionAudio.current) questionAudio.current.currentTime = 0;

    setQIndex(0);
    setHearts(0);
    setDisplayHearts(0);
    setSelected(null);
    setRevealed(false);
    setStarted(false);
    setInteracted(false); // Go all the way back to the very first heart
  };

  const moveNo = () => {
    setRunaway({
      x: Math.random() * 250 - 125,
      y: Math.random() * 200 - 100,
      scale: runaway.scale * 0.8,
    });
  };

  // SCREEN 1: AUDIO UNLOCKER
  if (!interacted) {
    return (
      <div style={styles.loader}>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={handleInteraction}
          style={{ cursor: "pointer", fontSize: 80 }}
        >
          ❤️
        </motion.div>
        <p style={{ color: "white", opacity: 0.6, fontSize: 14 }}>Click the heart to enable sound</p>
      </div>
    );
  }

  // SCREEN 2: LOGO INTRO
  if (!started) {
    return (
      <div style={styles.loader}>
        <motion.img
          src="/kbv-logo.png"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
          style={{ width: 180 }}
        />
        <motion.button
          onClick={startGame}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={styles.beginBtn}
        >
          Enter The Experience ❤️
        </motion.button>
      </div>
    );
  }

  // MAIN GAME UI
  return (
    <div style={styles.bg}>
      {q.finale && !revealed && <div style={styles.spotlight} />}

      {/* LOVE METER */}
      <motion.div
        style={styles.heart}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        ❤️ {displayHearts}% {displayHearts === 69 && "(nice)"}
      </motion.div>

      <div style={styles.timer}>⏳ {timer}</div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            style={styles.card}
          >
            <h2 style={styles.questionText}>{q.question}</h2>

            {q.options.map((opt, i) => {
              const runawayBtn = q.finale && i === 3;
              if (runawayBtn) {
                return (
                  <motion.button
                    key={i}
                    style={styles.no}
                    animate={runaway}
                    onMouseEnter={moveNo}
                    onClick={moveNo}
                  >
                    {opt}
                  </motion.button>
                );
              }

              const isCorrect = q.correct.includes(i);
              const isSelected = selected === i;

              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  style={{
                    ...styles.option,
                    ...(isSelected && isCorrect && styles.correctSelected),
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
            <img src={q.image} style={styles.image} alt="Memory" />

            {qIndex < questions.length - 1 ? (
              <button style={styles.beginBtn} onClick={next}>
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
    padding: "80px 20px 20px 20px", // Increased top padding to avoid meter overlap
    boxSizing: "border-box",
  },
  spotlight: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(circle at center, transparent 150px, rgba(0,0,0,0.94))",
    pointerEvents: "none",
  },
  card: {
    maxWidth: 500,
    margin: "auto",
    background: "rgba(0,0,0,0.75)",
    padding: 25,
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  questionText: {
    fontSize: "1.3rem",
    marginBottom: 20,
    lineHeight: 1.4,
  },
  option: {
    width: "100%",
    padding: 14,
    marginTop: 12,
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    fontSize: "1rem",
  },
  correctSelected: {
    background: "linear-gradient(45deg,#FFD700,#fff0a8)",
    boxShadow: "0 0 30px gold",
    transform: "scale(1.04)",
    color: "black",
    fontWeight: "bold",
  },
  no: {
    padding: 14,
    marginTop: 12,
    borderRadius: 12,
    border: "none",
    background: "#ff4d4d",
    color: "white",
    cursor: "pointer",
    minWidth: 100,
  },
  beginBtn: {
    padding: "14px 30px",
    borderRadius: 50,
    border: "none",
    cursor: "pointer",
    background: "white",
    color: "black",
    fontWeight: "bold",
    fontSize: "1rem",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    textAlign: "center",
  },
  image: {
    maxWidth: "90vw",
    maxHeight: "50vh",
    borderRadius: 15,
    objectFit: "cover",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  finalWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 25,
  },
  finalText: {
    fontSize: "clamp(24px, 6vw, 40px)", // Made smaller to fit mobile screens
    textAlign: "center",
    lineHeight: 1.3,
    background: "linear-gradient(45deg,#FFD700,#fff0a8)",
    WebkitBackgroundClip: "text",
    color: "transparent",
    fontWeight: "800",
    padding: "0 10px",
  },
  heart: {
    position: "absolute",
    right: 20,
    top: 20,
    fontSize: "1.2rem",
    fontWeight: "700",
    zIndex: 10,
  },
  timer: {
    position: "absolute",
    left: 20,
    top: 20,
    fontSize: "1.2rem",
    fontWeight: "700",
    zIndex: 10,
  },
};
