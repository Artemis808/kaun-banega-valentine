import { useEffect, useState } from "react";
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

  const q = questions[qIndex];

  // PRELOAD
  useEffect(() => {
    const images = questions.map((q) => {
      const img = new Image();
      img.src = q.image;
      return img;
    });

    setTimeout(() => setLoading(false), 1500);
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

  const selectAnswer = () => {
    setRevealed(true);

    const percent = qIndex === 3 ? 69 : Math.round(((qIndex + 1) / 5) * 100);
    setHearts(percent);
  };

  const next = () => {
    setRevealed(false);
    setQIndex((p) => p + 1);
    setRunaway({ x: 0, y: 0, scale: 1 });
  };

  const moveNo = () => {
    setRunaway({
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      scale: runaway.scale * 0.8,
    });
  };

  // LOADER
  if (loading) {
    return (
      <div style={styles.loader}>
        <motion.img
          src="/kbv-logo.png"
          style={{ width: 140 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        />
      </div>
    );
  }

  // INTRO
  if (!started) {
    return (
      <div style={styles.center}>
        <h2 style={{ color: "white" }}>
          For the best experience, turn your sound on ❤️
        </h2>
        <button style={styles.startBtn} onClick={() => setStarted(true)}>
          Tap To Begin
        </button>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      {/* Heart meter */}
      <div style={styles.heart}>
        ❤️ {hearts}% {hearts === 69 && "(nice)"}
      </div>

      {/* Timer */}
      <div style={styles.timer}>⏳ {timer}</div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
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
            style={styles.center}
          >
            <img src={q.image} style={styles.image} />

            {qIndex < questions.length - 1 ? (
              <button style={styles.startBtn} onClick={next}>
                Next Question
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
    height: "100vh",
    background: "black",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  bg: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at center, #14003a, #060012 60%, black)",
    color: "white",
    padding: 20,
  },
  card: {
    maxWidth: 600,
    margin: "auto",
    background: "rgba(0,0,0,0.6)",
    padding: 30,
    borderRadius: 20,
    backdropFilter: "blur(12px)",
  },
  option: {
    width: "100%",
    padding: 14,
    marginTop: 12,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
  },
  no: {
    padding: 14,
    marginTop: 12,
    borderRadius: 10,
    border: "none",
    background: "#ff4d4d",
    cursor: "pointer",
  },
  startBtn: {
    padding: "12px 26px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
  },
  image: {
    maxWidth: "80vw",
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
