"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/app/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import MoveEvaluation, { MoveQuality } from "@/app/components/MoveEvaluation";
import GameAnalysis from "@/app/components/GameAnalysis";
import { evaluateMove, parseStockfishScore, EvaluationResult } from "@/app/lib/moveEvaluator";

interface MoveHistory {
  move: string;
  quality: MoveQuality;
  notation: string;
}

export default function Home() {
  const [game, setGame] = useState(new Chess());
  const [mode, setMode] = useState<"local" | "bot" | "online">("local");
  const [roomId, setRoomId] = useState("");
  const [myColor, setMyColor] = useState<"w" | "b">("w");
  const [stockfish, setStockfish] = useState<Worker | null>(null);
  const [evaluationWorker, setEvaluationWorker] = useState<Worker | null>(null);
  const [currentMoveQuality, setCurrentMoveQuality] = useState<MoveQuality>(null);
  const [lastMove, setLastMove] = useState<string>("");
  const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([]);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const previousScoreRef = useRef<number>(0);

  const safeGameMutate = useCallback((modify: (g: Chess) => void) => {
    setGame((g) => {
      const update = new Chess(g.fen());
      modify(update);
      return update;
    });
  }, []);

  // Bot Stockfish
  useEffect(() => {
    if (mode === "bot") {
      const worker = new Worker("/stockfish/stockfish.js");
      worker.onmessage = (event) => {
        const msg = event.data.trim();
        if (msg.startsWith("bestmove")) {
          const move = msg.split(" ")[1];
          if (move && move !== "(none)") {
            safeGameMutate((g) => g.move(move));
          }
        }
      };
      worker.postMessage("uci");
      worker.postMessage("isready");
      setStockfish(worker);
      return () => worker.terminate();
    }
  }, [mode, safeGameMutate]);

  // Evaluation Worker để đánh giá nước đi
  useEffect(() => {
    // Chỉ tạo evaluation worker khi không phải mode online (vì online không cần đánh giá)
    if (mode !== "online") {
      const worker = new Worker("/stockfish/stockfish.js");
      worker.postMessage("uci");
      worker.postMessage("isready");
      setEvaluationWorker(worker);
      return () => worker.terminate();
    }
  }, [mode]);

  const makeBotMove = () => {
    if (stockfish && !game.isGameOver() && game.turn() === "b") {
      stockfish.postMessage(`position fen ${game.fen()}`);
      stockfish.postMessage("go depth 12");
    }
  };

  // Hàm đánh giá nước đi khi người chơi đi
  const analyzeMove = useCallback((moveNotation: string) => {
    if (!evaluationWorker || mode === "online") return;

    const tempGame = new Chess(game.fen());
    const history = tempGame.history({ verbose: true });
    if (history.length < 1) return;

    // Lấy FEN trước nước đi
    tempGame.undo();
    const fenBeforeMove = tempGame.fen();

    let bestScore = 0;
    let playerScore = 0;
    let bestMoveFound = false;
    let playerScoreFound = false;

    const handleEvaluation = (event: MessageEvent) => {
      const msg = event.data.trim();
      
      // Tìm nước đi tốt nhất và điểm số của nó
      if (msg.startsWith("info") && msg.includes("score") && msg.includes("depth 10") && !bestMoveFound) {
        const scoreMatch = msg.match(/score (cp|mate) (-?\d+)/);
        if (scoreMatch && msg.includes("pv")) {
          const scoreType = scoreMatch[1];
          const scoreValue = parseInt(scoreMatch[2]);
          bestScore = scoreType === "mate"
            ? (scoreValue > 0 ? 10000 - scoreValue * 100 : -10000 - Math.abs(scoreValue) * 100)
            : scoreValue;
          
          // Đảo ngược vì đây là điểm số từ góc nhìn của đối thủ
          bestScore = -bestScore;
          previousScoreRef.current = bestScore;
          bestMoveFound = true;
        }
      }

      // Đánh giá nước đi của người chơi
      if (msg.startsWith("info") && msg.includes("score") && msg.includes("depth 10") && bestMoveFound && !playerScoreFound) {
        const scoreMatch = msg.match(/score (cp|mate) (-?\d+)/);
        if (scoreMatch) {
          const scoreType = scoreMatch[1];
          const scoreValue = parseInt(scoreMatch[2]);
          playerScore = scoreType === "mate"
            ? (scoreValue > 0 ? 10000 - scoreValue * 100 : -10000 - Math.abs(scoreValue) * 100)
            : scoreValue;
          
          playerScore = -playerScore;
          playerScoreFound = true;

          // So sánh và đánh giá
          const quality = evaluateMove(playerScore, bestScore, previousScoreRef.current);
          setCurrentMoveQuality(quality);
          setMoveHistory(prev => [...prev, { move: moveNotation, quality, notation: moveNotation }]);
          
          evaluationWorker.removeEventListener("message", handleEvaluation);
        }
      }
    };

    evaluationWorker.addEventListener("message", handleEvaluation);

    // Đánh giá vị trí trước nước đi để tìm nước đi tốt nhất
    evaluationWorker.postMessage(`position fen ${fenBeforeMove}`);
    evaluationWorker.postMessage("go depth 10");

    // Đánh giá nước đi của người chơi
    setTimeout(() => {
      tempGame.load(fenBeforeMove);
      tempGame.move(moveNotation);
      const fenAfterMove = tempGame.fen();
      evaluationWorker.postMessage(`position fen ${fenAfterMove}`);
      evaluationWorker.postMessage("go depth 10");
    }, 500);
  }, [evaluationWorker, game, mode]);

  // Online mode
  useEffect(() => {
    if (mode === "online") {
      const urlParams = new URLSearchParams(window.location.search);
      let id = urlParams.get("room");

      if (!id) {
        id = uuidv4().slice(0, 8);
        window.history.replaceState({}, "", `?room=${id}`);
        setRoomId(id);
        setMyColor("w");
        set(ref(db, `rooms/${id}`), { fen: game.fen() });
      } else {
        setRoomId(id);
        setMyColor("b");
      }

      const roomRef = ref(db, `rooms/${id}`);
      onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data?.fen) {
          safeGameMutate((g) => g.load(data.fen));
        }
      });
    }
  }, [mode]);

  useEffect(() => {
    if (mode === "online" && roomId) {
      set(ref(db, `rooms/${roomId}`), { fen: game.fen() });
    }
  }, [game.fen(), mode, roomId]);

  function onDrop(sourceSquare: string, targetSquare: string) {
    try {
      // Tạo bản copy của game để kiểm tra move
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!move) {
        return false;
      }

      const moveNotation = move.san;
      
      // Lưu FEN trước khi đi nước (chỉ lần đầu)
      const currentFen = game.fen();
      if (gameHistory.length === 0) {
        setGameHistory([currentFen]);
      }

      // Cập nhật game state
      setGame((prevGame) => {
        const newGame = new Chess(prevGame.fen());
        const result = newGame.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });
        
        if (result) {
          setLastMove(moveNotation);
          // Lưu FEN sau khi đi nước
          setGameHistory((prev) => [...prev, newGame.fen()]);
          
          // Đánh giá nước đi (chỉ khi không phải online và là lượt của người chơi)
          if (mode !== "online" && (mode === "local" || (mode === "bot" && newGame.turn() === "b"))) {
            setTimeout(() => {
              analyzeMove(moveNotation);
            }, 100);
          }

          if (mode === "bot") {
            setTimeout(() => makeBotMove(), 500);
          }
        }
        
        return newGame;
      });

      return true;
    } catch (error) {
      console.error("Error in onDrop:", error);
      return false;
    }
  }

  const canDrag =
    mode === "local" ||
    (mode === "bot" && game.turn() === "w") ||
    (mode === "online" && game.turn() === myColor.charAt(0));

  if (game.isGameOver()) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
          <h1 className="text-5xl mb-8 font-bold drop-shadow-lg">Game Over!</h1>
          <p className="text-2xl mb-8">
            {game.isCheckmate()
              ? "Chiếu hết! 🎯"
              : game.isDraw()
              ? "Hòa! 🤝"
              : "Kết thúc"}
          </p>
          
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setShowAnalysis(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-lg text-xl font-semibold transition-all shadow-lg"
            >
              📊 Phân tích ván đấu
            </button>
            <button
              onClick={() => {
                setGame(new Chess());
                setMoveHistory([]);
                setGameHistory([]);
                setShowAnalysis(false);
              }}
              className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg text-xl font-semibold transition-all shadow-lg"
            >
              🔄 Chơi lại
            </button>
          </div>

          {moveHistory.length > 0 && (
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 max-w-2xl w-full">
              <h3 className="text-xl font-bold mb-4">Tóm tắt nước đi:</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-2xl font-bold">{moveHistory.filter(m => m.quality === "best").length}</div>
                  <div className="text-white/70">Tốt nhất</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">😬</div>
                  <div className="text-2xl font-bold">{moveHistory.filter(m => m.quality === "mistake").length}</div>
                  <div className="text-white/70">Sai lầm</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🤦</div>
                  <div className="text-2xl font-bold">{moveHistory.filter(m => m.quality === "blunder").length}</div>
                  <div className="text-white/70">Ngớ ngẩn</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {showAnalysis && (
          <GameAnalysis
            gameHistory={gameHistory.length > 0 ? gameHistory : [game.fen()]}
            pgn={game.pgn()}
            onClose={() => setShowAnalysis(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold text-white mb-10 drop-shadow-lg">
        Pro Chess ♟️
      </h1>

      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <button
          onClick={() => setMode("local")}
          className={`px-8 py-4 rounded-lg text-xl font-semibold transition-all ${
            mode === "local" ? "bg-green-600 shadow-lg" : "bg-gray-700"
          } text-white`}
        >
          Chơi local (2 người)
        </button>
        <button
          onClick={() => setMode("bot")}
          className={`px-8 py-4 rounded-lg text-xl font-semibold transition-all ${
            mode === "bot" ? "bg-orange-600 shadow-lg" : "bg-gray-700"
          } text-white`}
        >
          Chơi với Bot (AI mạnh)
        </button>
        <button
          onClick={() => setMode("online")}
          className={`px-8 py-4 rounded-lg text-xl font-semibold transition-all ${
            mode === "online" ? "bg-purple-600 shadow-lg" : "bg-gray-700"
          } text-white`}
        >
          Chơi Online {roomId && `(Phòng: ${roomId})`}
        </button>
      </div>

      {mode === "online" && roomId && (
        <p className="text-white text-lg mb-6 bg-black/30 px-6 py-3 rounded-lg">
          Share link: <strong>{window.location.href}</strong>
        </p>
      )}

      <div className="flex gap-6 items-start">
        <div className="shadow-2xl rounded-xl overflow-hidden border-4 border-white/20">
          {/* @ts-ignore - react-chessboard v5 API */}
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            arePiecesDraggable={canDrag}
            boardOrientation={myColor === "b" ? "black" : "white"}
            boardWidth={600}
            key={game.fen()}
          />
        </div>

        {/* Lịch sử nước đi */}
        {moveHistory.length > 0 && (
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 max-h-[600px] overflow-y-auto min-w-[250px]">
            <h3 className="text-white text-xl font-bold mb-4">Lịch sử nước đi</h3>
            <div className="space-y-2">
              {moveHistory.map((item, index) => {
                const qualityIcons: Record<Exclude<MoveQuality, null>, string> = {
                  brilliant: "✨",
                  best: "⭐",
                  good: "👍",
                  inaccuracy: "⚠️",
                  mistake: "❌",
                  blunder: "💥",
                };
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-white bg-white/10 rounded-lg px-3 py-2"
                  >
                    <span className="text-lg">{item.quality ? qualityIcons[item.quality] : ""}</span>
                    <span className="font-mono">{item.notation}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hiển thị đánh giá nước đi */}
      <MoveEvaluation
        quality={currentMoveQuality}
        move={lastMove}
        onAnimationEnd={() => setCurrentMoveQuality(null)}
      />

      <p className="text-white text-2xl mt-8 font-semibold">
        Lượt đi: {game.turn() === "w" ? "Trắng" : "Đen"}
      </p>
    </div>
  );
}
