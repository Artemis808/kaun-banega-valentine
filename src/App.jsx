import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

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
    question: "What was technically the first meal you made for me?",
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
      "If not for your current job, which job would you be perfect for?",
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
    question:
      "At what moment did I realize my life had quietly changed forever?",
    options: [
      "Kantara Day",
      "All the 11:11s",
      "Cubbon park",
      "Our first 31/12",
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
  const [soundUnlocked, setSoundUnlocked] = useState(false);
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

  // Smooth Love Meter
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

  // Timer
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

  // SOUND UNLOCK
  const unlockSound = async () => {
    try {
      await openingAudio.current.play();
      openingAudio.current.pause();
      openingAudio.current.currentTime = 0;

      setSoundUnlocked(true);
    } catch {
      setSoundUnlocked(true);
    }
  };

  const startExperience = async () => {
    openingAudio.current.volume = 0.6;
    questionAudio.current.volume = 0.35;

    openingAudio.current.play();

    setTimeout(() => {
      questionAudio.current.play();
    }, 2500);

    setStarted(true);
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
  };

  const restartGame = () => {
    finaleAudio.current?.pause();
    questionAudio.current?.pause();

    setSoundUnlocked(false);
    setStarted(false);
    setQIndex(0);
    setHearts(0);
    setDisplayHearts(0);
    setSelected(null);
    setRevealed(false);
  };

  // SOUND SCREEN
  if (!soundUnlocked) {
    return (
      <div style={styles.loader}>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={styles.soundButton}
          onClick={unlockSound}
        >
          🔊 Tap To Enable Sound ❤️
        </motion.div>
      </div>
    );
  }

  // LOGO SCREEN
  if (!started) {
    return (
      <div style={styles.loader}>
        <motion.img
          src="/kbv-logo.png"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
          style={{ width: 200 }}
        />

        <button style={styles.beginBtn} onClick={startExperience}>
          Begin ❤️
        </button>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
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
            style={styles.card}
          >
            <h2>{q.question}</h2>

            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                style={{
                  ...styles.option,
                  ...(selected === i &&
                    q.correct.includes(i) && {
                      background: "linear-gradient(45deg,#FFD700,#fff0a8)",
                      boxShadow: "0 0 30px gold",
                      transform: "scale(1.06)",
                    }),
                }}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div style={styles.center}>
            <img src={q.image} style={styles.image} />

            {qIndex < questions.length - 1 ? (
              <button style={styles.beginBtn} onClick={next}>
                Continue ❤️
              </button>
            ) : (
              <>
                <h1 style={styles.finalText}>
                  ❤️ Happy Valentine’s Day  
                  <br />
                  To My Forever Valentine ❤️
                </h1>

                <button style={styles.beginBtn} onClick={restartGame}>
                  Back To Start ❤️
                </button>
              </>
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
    flexDirection: "column",
    gap: 40,
  },
  soundButton: {
    padding: "20px 36px",
    borderRadius: 20,
    background: "linear-gradient(45deg,#ff4d6d,#ff758f)",
    cursor: "pointer",
    fontSize: 20,
    fontWeight: "700",
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
  },
  option: {
    width: "100%",
    padding: 14,
    marginTop: 12,
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    padding: "40px 20px",
    textAlign: "center",
  },
  image: {
    maxWidth: "85vw",
    maxHeight: "65vh",
    borderRadius: 20,
  },
  finalText: {
    fontSize: "clamp(26px, 6vw, 42px)",
    lineHeight: 1.2,
    background: "linear-gradient(45deg,#FFD700,#fff0a8)",
    WebkitBackgroundClip: "text",
    color: "transparent",
    fontWeight: "800",
  },
  beginBtn: {
    padding: "14px 30px",
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
  },
  heart: {
    position: "absolute",
    right: 20,
    top: 20,
    fontSize: "clamp(20px,3.5vw,28px)",
    fontWeight: "700",
  },
  timer: {
    position: "absolute",
    left: 20,
    top: 20,
    fontSize: "clamp(22px,4vw,32px)",
    fontWeight: "700",
  },
};
