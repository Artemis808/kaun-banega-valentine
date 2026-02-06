import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const questions = [
  {
    question:
      "What is Sarangae and why is stuck in my mind from my first impression of you?",
    options: [
      "BTS for the win!",
      "Saran-gayyyy",
      "Both b and c",
      "I love you bb",
    ],
    correct: [3],
    image: "/kbv-images/1.jpg",
  },
  {
    question:
      "What was technically the first meal you made for me (with or without the help of others?)",
    options: [
      "You is a snacc",
      "Bheja fryyy",
      "Pepper Chicken",
      "Poha with veggies",
    ],
    correct: [2],
    image: "/kbv-images/2.jpg",
  },
  {
    question:
      "If not for your current job, in another universe, which job would you be perfect for?",
    options: [
      "Fasshun model and trend setter",
      "Interior designer",
      "Personal chef (only for me😛)",
      "Artist",
      "Im a riderrr",
      "Dancer",
      "All of the above and more!",
    ],
    correct: [6],
    image: "/kbv-images/3.jpg",
  },
  {
    question:
      "At what moment did I realize my life had quietly changed forever?",
    options: [
      "Kantara Movie Day",
      "11:11 — the past one and all to come",
      "Cubbon park before SSB",
      "The first of many 31/12’s",
    ],
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
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [timer, setTimer] = useState(15);
  const [hearts, setHearts] = useState(0);
  const [runaway, setRunaway] = useState({ x: 0, y: 0, scale: 1 });

  // AUDIO
  const openingAudio = useRef(null);
  const questionAudio = useRef(null);
  const correctAudio = useRef(null);
  const finaleAudio = useRef(null);

  const q = questions[qIndex];

  // PRELOAD EVERYTHING
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

    setTimeout(() => setLoading(false), 1200);
  }, []);

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

  const startGame = () => {
    openingAudio.current.play();
    questionAudio.current.volume = 0.35;
    questionAudio.current.play();
    setStarted(true);
  };

  const selectAnswer = () => {
    correctAudio.current.play();
    setRevealed(true);

    const percent = qIndex === 3 ? 69 : Math.round(((qIndex + 1) / 5) * 100);
    setHearts(percent);

    if (q.finale) {
      questionAudio.current.pause();
      finaleAudio.current.play();
    }
  };

  const next = () => {
    setRevealed(false);
    setQIndex((p) => p + 1);
    setRunaway({ x: 0, y: 0, scale: 1 });
  };

  const moveNo = () => {
    setRunaway({
      x: Math.random() * 250 - 125,
      y: Math.random() * 200 - 100,
      scale: runaway.scale * 0.8,
    });
  };

  // LOADER
  if (loading) {
    return (
      <div style={styles.loader}>
        <img src="/kbv-logo.png" style={{ width: 170 }} />
      </div>
    );
  }

  // INTRO
  if (!started) {
    return (
      <div style={styles.center}>
        <h2 style={{ color: "white", textAlign: "center" }}>
          For the best experience, turn your sound on ❤️
        </h2>
        <button style={styles.startBtn} onClick={startGame}>
          Tap To Begin
        </button>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      <div style={styles.heart}>
        ❤️ {hearts}% {hearts === 69 && "(nice)"}
      </div>

      <div style={styles.timer}>⏳ {timer}</div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45 }}
            style={styles.card}
          >
            <h2>{q.question}</h2>

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

              return (
                <button key={i} style={styles.option} onClick={selectAnswer}>
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
            transition={{ duration: 0.6 }}
            style={styles.center}
          >
            <img src={q.image} style={styles.image} />

            {qIndex < questions.length - 1 ? (
              <button style={styles.startBtn} onClick={next}>
                Continue ❤️
              </button>
            ) : (
              <h1 style={{ color: "white" }}>🎉 Happy Valentine’s ❤️</h1>
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
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    minHeight: "100vh",
    background: "black",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    padding: 20,
  },
  bg: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at center, #14003a, #060012 60%, black)",
    color: "white",
    padding: 20,
  },
  card: {
    maxWidth: 650,
    margin: "auto",
    background: "rgba(0,0,0,0.65)",
    padding: 30,
    borderRadius: 20,
    backdropFilter: "blur(14px)",
  },
  option: {
    width: "100%",
    padding: 14,
    marginTop: 12,
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontSize: 16,
  },
  no: {
    padding: 14,
    marginTop: 12,
    borderRadius: 12,
    border: "none",
    background: "#ff4d4d",
    cursor: "pointer",
  },
  startBtn: {
    padding: "14px 28px",
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
    fontSize: 16,
  },
  image: {
    maxWidth: "85vw",
    maxHeight: "65vh",
    objectFit: "contain",
    borderRadius: 20,
  },
  heart: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  timer: {
    position: "absolute",
    left: 20,
    top: 20,
  },
};
