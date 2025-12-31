import { Chess } from "chess.js";
import { MoveQuality } from "@/app/components/MoveEvaluation";

export interface EvaluationResult {
  quality: MoveQuality;
  score: number; // centipawns
  bestMove?: string;
}

/**
 * Đánh giá chất lượng nước đi dựa trên điểm số từ Stockfish
 * @param playerScore - Điểm số của nước đi người chơi (centipawns)
 * @param bestScore - Điểm số của nước đi tốt nhất (centipawns)
 * @param previousScore - Điểm số trước khi đi nước này
 */
export function evaluateMove(
  playerScore: number,
  bestScore: number,
  previousScore: number
): MoveQuality {
  const scoreDiff = playerScore - bestScore;
  const scoreLoss = previousScore - playerScore;

  // Nếu nước đi của người chơi bằng hoặc gần bằng nước đi tốt nhất
  if (Math.abs(scoreDiff) <= 20) {
    // Kiểm tra xem có phải là nước đi đặc biệt không (ví dụ: sacrifice, tactical)
    if (scoreDiff >= -10 && scoreLoss > 200) {
      // Có thể là sacrifice - brilliant move
      return "brilliant";
    }
    return "best";
  }

  // Nước đi tốt (mất ít điểm)
  if (scoreDiff >= -50 && scoreDiff < -20) {
    return "good";
  }

  // Nước đi không chính xác (mất điểm vừa phải)
  if (scoreDiff >= -100 && scoreDiff < -50) {
    return "inaccuracy";
  }

  // Nước đi sai lầm (mất nhiều điểm)
  if (scoreDiff >= -200 && scoreDiff < -100) {
    return "mistake";
  }

  // Nước đi sai nghiêm trọng (mất rất nhiều điểm)
  if (scoreDiff < -200) {
    return "blunder";
  }

  return "good";
}

/**
 * Parse điểm số từ Stockfish output
 * @param scoreStr - String từ Stockfish (ví dụ: "cp 150" hoặc "mate 3")
 */
export function parseStockfishScore(scoreStr: string): number {
  if (scoreStr.includes("mate")) {
    const mateIn = parseInt(scoreStr.split(" ")[1]);
    // Mate in N moves = rất tốt (hoặc rất tệ nếu âm)
    return mateIn > 0 ? 10000 - mateIn * 100 : -10000 - Math.abs(mateIn) * 100;
  }
  if (scoreStr.includes("cp")) {
    return parseInt(scoreStr.split(" ")[1]);
  }
  return 0;
}

