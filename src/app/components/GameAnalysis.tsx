"use client";

import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { MoveQuality } from "./MoveEvaluation";

interface MoveAnalysis {
  moveNumber: number;
  move: string;
  quality: MoveQuality;
  centipawnLoss: number;
  bestMove?: string;
}

interface GameAnalysisProps {
  gameHistory: string[]; // Array of FEN positions or PGN
  pgn?: string;
  onClose?: () => void;
}

const GameAnalysis = ({ gameHistory, pgn, onClose }: GameAnalysisProps) => {
  const [analysis, setAnalysis] = useState<MoveAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    if (gameHistory.length === 0) return;

    const analyzeGame = async () => {
      setIsAnalyzing(true);
      const workerInstance = new Worker("/stockfish/stockfish.js");
      
      workerInstance.postMessage("uci");
      workerInstance.postMessage("isready");

      const tempGame = new Chess();
      const moves: MoveAnalysis[] = [];
      let moveNumber = 0;

      const analyzePosition = (fenBefore: string, fenAfter: string, moveNotation: string): Promise<MoveAnalysis> => {
        return new Promise((resolve) => {
          let bestScore = 0;
          let playerScore = 0;
          let bestMoveFound = false;
          let playerScoreFound = false;
          let previousScore = 0;

          const handleMessage = (event: MessageEvent) => {
            const msg = event.data.trim();

            // Tìm best move và score từ vị trí trước
            if (msg.startsWith("info") && msg.includes("score") && msg.includes("depth 10") && !bestMoveFound) {
              const scoreMatch = msg.match(/score (cp|mate) (-?\d+)/);
              if (scoreMatch && msg.includes("pv")) {
                const scoreType = scoreMatch[1];
                const scoreValue = parseInt(scoreMatch[2]);
                bestScore = scoreType === "mate"
                  ? (scoreValue > 0 ? 10000 - scoreValue * 100 : -10000 - Math.abs(scoreValue) * 100)
                  : scoreValue;
                
                bestScore = -bestScore; // Đảo ngược vì đổi lượt
                previousScore = bestScore;
                bestMoveFound = true;
                
                // Sau khi có best score, đánh giá nước đi của người chơi
                setTimeout(() => {
                  workerInstance.postMessage(`position fen ${fenAfter}`);
                  workerInstance.postMessage("go depth 10");
                }, 100);
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

                const centipawnLoss = Math.abs(bestScore - playerScore);
                const quality = evaluateMoveQuality(centipawnLoss);
                
                workerInstance.removeEventListener("message", handleMessage);
                resolve({
                  moveNumber: moveNumber + 1,
                  move: moveNotation,
                  quality,
                  centipawnLoss: Math.round(centipawnLoss),
                });
              }
            }
          };

          workerInstance.addEventListener("message", handleMessage);
          
          // Đánh giá vị trí trước nước đi để tìm best move
          workerInstance.postMessage(`position fen ${fenBefore}`);
          workerInstance.postMessage("go depth 10");
        });
      };

      // Phân tích từng nước đi
      for (let i = 0; i < gameHistory.length - 1; i++) {
        const fenBefore = gameHistory[i];
        const fenAfter = gameHistory[i + 1];
        
        tempGame.load(fenBefore);
        const history = tempGame.history({ verbose: true });
        const lastMove = history[history.length - 1];
        
        if (lastMove && fenAfter) {
          const moveAnalysis = await analyzePosition(fenBefore, fenAfter, lastMove.san);
          moves.push(moveAnalysis);
          moveNumber++;
          setProgress(((i + 1) / (gameHistory.length - 1)) * 100);
        }
      }

      setAnalysis(moves);
      setIsAnalyzing(false);
      workerInstance.terminate();
    };

    analyzeGame();

    return () => {
      if (worker) {
        worker.terminate();
      }
    };
  }, [gameHistory]);

  const evaluateMoveQuality = (centipawnLoss: number): MoveQuality => {
    if (centipawnLoss <= 20) return "best";
    if (centipawnLoss <= 50) return "good";
    if (centipawnLoss <= 100) return "inaccuracy";
    if (centipawnLoss <= 200) return "mistake";
    return "blunder";
  };

  const qualityIcons: Record<Exclude<MoveQuality, null>, string> = {
    brilliant: "💡",
    best: "⭐",
    good: "👍",
    inaccuracy: "⚠️",
    mistake: "😬",
    blunder: "🤦",
  };

  const qualityLabels: Record<Exclude<MoveQuality, null>, string> = {
    brilliant: "Nước đi thiên tài",
    best: "Nước đi tốt nhất",
    good: "Nước đi tốt",
    inaccuracy: "Không chính xác",
    mistake: "Sai lầm",
    blunder: "Ngớ ngẩn",
  };

  const stats = {
    brilliant: analysis.filter((a) => a.quality === "brilliant").length,
    best: analysis.filter((a) => a.quality === "best").length,
    good: analysis.filter((a) => a.quality === "good").length,
    inaccuracy: analysis.filter((a) => a.quality === "inaccuracy").length,
    mistake: analysis.filter((a) => a.quality === "mistake").length,
    blunder: analysis.filter((a) => a.quality === "blunder").length,
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/20">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">Phân tích ván đấu</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            )}
          </div>

          {isAnalyzing ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">♟️</div>
              <p className="text-white text-xl mb-4">Đang phân tích ván đấu...</p>
              <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white/70">{Math.round(progress)}%</p>
            </div>
          ) : analysis.length > 0 ? (
            <>
              {/* Thống kê */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">💡</div>
                  <div className="text-white font-bold">{stats.brilliant}</div>
                  <div className="text-white/70 text-xs">Thiên tài</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-white font-bold">{stats.best}</div>
                  <div className="text-white/70 text-xs">Tốt nhất</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">👍</div>
                  <div className="text-white font-bold">{stats.good}</div>
                  <div className="text-white/70 text-xs">Tốt</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">⚠️</div>
                  <div className="text-white font-bold">{stats.inaccuracy}</div>
                  <div className="text-white/70 text-xs">Không chính xác</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">😬</div>
                  <div className="text-white font-bold">{stats.mistake}</div>
                  <div className="text-white/70 text-xs">Sai lầm</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">🤦</div>
                  <div className="text-white font-bold">{stats.blunder}</div>
                  <div className="text-white/70 text-xs">Ngớ ngẩn</div>
                </div>
              </div>

              {/* Danh sách nước đi */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white mb-4">Chi tiết từng nước đi:</h3>
                {analysis.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-white/70 font-mono">#{item.moveNumber}</span>
                        <span className="text-2xl">{item.quality ? qualityIcons[item.quality] : ""}</span>
                        <span className="text-white font-bold">{item.move}</span>
                        <span className="text-white/70 text-sm">
                          {item.quality ? qualityLabels[item.quality] : ""}
                        </span>
                      </div>
                      <div className="text-white/70 text-sm">
                        Mất {item.centipawnLoss} centipawns
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-white">
              <p>Không có dữ liệu để phân tích</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameAnalysis;

