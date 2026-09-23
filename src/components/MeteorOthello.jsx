import React, { useState, useEffect, useCallback } from 'react';
import ConfirmModal from './ConfirmModal';

// 定数定義
const BOARD_SIZE = 8;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;
const METEOR = 3;

// 方向ベクトル (上, 下, 左, 右, 斜め4方向)
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

const MeteorOthello = () => {
  const [board, setBoard] = useState(Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY)));
  const [currentPlayer, setCurrentPlayer] = useState(BLACK);
  const [isGameOver, setIsGameOver] = useState(false);
  const [scores, setScores] = useState({ black: 2, white: 2 });
  const [validMoves, setValidMoves] = useState([]);
  const [passMessage, setPassMessage] = useState('');
  const [lastPlaced, setLastPlaced] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // 指定したマスに石が置けるかチェックし、裏返せるマスのリストを返す
  const getFlipList = useCallback((currentBoard, row, col, player) => {
    if (currentBoard[row][col] !== EMPTY) return [];
    
    const opponent = player === BLACK ? WHITE : BLACK;
    let totalFlipList = [];

    for (const [dr, dc] of DIRECTIONS) {
      let r = row + dr;
      let c = col + dc;
      let pathFlipList = [];

      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (currentBoard[r][c] === opponent) {
          pathFlipList.push([r, c]);
        } else if (currentBoard[r][c] === player) {
          if (pathFlipList.length > 0) {
            totalFlipList = [...totalFlipList, ...pathFlipList];
          }
          break;
        } else {
          // EMPTY or METEOR
          break;
        }
        r += dr;
        c += dc;
      }
    }
    return totalFlipList;
  }, []);

  // 有効な手のリストを取得
  const calculateValidMoves = useCallback((currentBoard, player) => {
    const moves = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (getFlipList(currentBoard, r, c, player).length > 0) {
          moves.push(`${r},${c}`);
        }
      }
    }
    return moves;
  }, [getFlipList]);

  // ゲームの初期化
  const initializeGame = useCallback(() => {
    let newBoard;
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      newBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
      
      // 初期配置
      newBoard[3][3] = WHITE;
      newBoard[3][4] = BLACK;
      newBoard[4][3] = BLACK;
      newBoard[4][4] = WHITE;

      // 隕石の配置 (左上4x4から2点選び、対称に配置)
      const candidates = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (r === 3 && c === 3) continue; // 中央の石の場所は避ける
          candidates.push([r, c]);
        }
      }

      // ランダムに2点選択
      const shuffled = candidates.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 2);

      selected.forEach(([r, c]) => {
        // 点対称および軸対称の計8箇所に配置
        const points = [
          [r, c],
          [7 - r, 7 - c], // 点対称
          [r, 7 - c],     // 左右対称
          [7 - r, c],     // 上下対称
        ];
        // 重複を除いて配置 (中心に近い場合などは重複しうるが、基本は8個)
        points.forEach(([pr, pc]) => {
          if (newBoard[pr][pc] === EMPTY) {
            newBoard[pr][pc] = METEOR;
          }
        });
      });

      // 最初のターン（黒）がどこかに置けるか確認
      if (calculateValidMoves(newBoard, BLACK).length > 0) {
        break;
      }
      attempts++;
    }

    setBoard(newBoard);
    setCurrentPlayer(BLACK);
    setIsGameOver(false);
    setScores({ black: 2, white: 2 });
    setPassMessage('');
    setLastPlaced(null);
    setValidMoves(calculateValidMoves(newBoard, BLACK));
  }, [calculateValidMoves]);

  // 初回起動
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // 石を置く
  const handleCellClick = (r, c) => {
    if (isGameOver || !validMoves.includes(`${r},${c}`)) return;

    const flipList = getFlipList(board, r, c, currentPlayer);
    const newBoard = board.map(row => [...row]);
    
    newBoard[r][c] = currentPlayer;
    flipList.forEach(([fr, fc]) => {
      newBoard[fr][fc] = currentPlayer;
    });

    const nextPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    const nextMoves = calculateValidMoves(newBoard, nextPlayer);

    setBoard(newBoard);
    setLastPlaced(`${r},${c}`);
    
    // スコア計算
    let black = 0;
    let white = 0;
    newBoard.forEach(row => {
      row.forEach(cell => {
        if (cell === BLACK) black++;
        if (cell === WHITE) white++;
      });
    });
    setScores({ black, white });

    if (nextMoves.length > 0) {
      setCurrentPlayer(nextPlayer);
      setValidMoves(nextMoves);
      setPassMessage('');
    } else {
      // パス判定
      const currentMovesAfterPass = calculateValidMoves(newBoard, currentPlayer);
      if (currentMovesAfterPass.length > 0) {
        // パス発生
        setPassMessage(`${nextPlayer === BLACK ? '黒' : '白'}は置ける場所がないためパスしました`);
        setValidMoves(currentMovesAfterPass);
      } else {
        // 両者置けない -> ゲーム終了
        setIsGameOver(true);
        setValidMoves([]);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-sm">
          隕石オセロ
        </h1>
        <div className="text-xl text-emerald-200/80 flex items-center justify-center gap-2">
          <span>隕石</span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-500 to-slate-800 shadow-lg ring-1 ring-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3/5 h-3/5 text-slate-300">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 8h.01" />
              <path d="M16 11h.01" />
              <path d="M10 15h.01" />
              <path d="M15 17h.01" />
            </svg>
          </div>
          <span>を避けて石を置こう！</span>
        </div>
      </header>

      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
        {/* Score Board */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${currentPlayer === BLACK ? 'bg-emerald-500/20 ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-700/50'}`}>
            <span className="text-sm font-bold opacity-60">BLACK</span>
            <span className="text-3xl font-black">{scores.black}</span>
          </div>
          <div className="flex items-center justify-center text-2xl font-black italic opacity-30">
            {isGameOver ? 'FINISH' : 'VS'}
          </div>
          <div className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${currentPlayer === WHITE ? 'bg-emerald-500/20 ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-700/50'}`}>
            <span className="text-sm font-bold opacity-60">WHITE</span>
            <span className="text-3xl font-black">{scores.white}</span>
          </div>
        </div>

        {/* Status Message */}
        <div className="h-12 flex items-center justify-center mb-6 text-center">
          {isGameOver ? (
            <div className="text-2xl font-bold animate-bounce">
              {scores.black > scores.white ? '🎉 黒の勝ち！' : scores.white > scores.black ? '🎉 白の勝ち！' : '🤝 引き分け！'}
            </div>
          ) : (
            <div className="text-lg font-medium">
              {currentPlayer === BLACK ? '黒 (あなた)の番です' : '白 (相手)の番です'}
            </div>
          )}
        </div>

        {passMessage && (
          <div className="mb-4 text-center py-2 px-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 font-bold animate-pulse">
            {passMessage}
          </div>
        )}

        {/* Board */}
        <div className="aspect-square w-full grid grid-cols-8 gap-1 bg-emerald-950/50 p-1.5 rounded-xl border border-emerald-500/30 overflow-hidden shadow-inner">
          {board.map((row, r) => 
            row.map((cell, c) => {
              const isValid = validMoves.includes(`${r},${c}`);
              const isLast = lastPlaced === `${r},${c}`;
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative flex items-center justify-center aspect-square rounded-[4px] cursor-pointer transition-colors duration-200 
                    ${isValid ? 'hover:bg-emerald-400/20' : ''} 
                    ${isLast ? 'bg-emerald-400/10' : 'bg-emerald-900/30'}`}
                >
                  {/* Valid Move Guide */}
                  {isValid && !cell && (
                    <div className="w-3 h-3 rounded-full bg-emerald-400/40" />
                  )}

                  {/* Stones or Meteor */}
                  {cell === BLACK && (
                    <div className="w-4/5 h-4/5 rounded-full bg-gradient-to-br from-gray-700 to-black shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] ring-1 ring-white/10 animate-stone-flip" />
                  )}
                  {cell === WHITE && (
                    <div className="w-4/5 h-4/5 rounded-full bg-gradient-to-br from-white to-gray-300 shadow-md ring-1 ring-black/10 animate-stone-flip" />
                  )}
                  {cell === METEOR && (
                    <div className="w-4/5 h-4/5 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-900 shadow-lg ring-1 ring-white/20">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3/5 h-3/5 text-slate-300">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 8h.01" />
                        <path d="M16 11h.01" />
                        <path d="M10 15h.01" />
                        <path d="M15 17h.01" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Controls */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 ring-2 ring-white/10 cursor-pointer"
          >
            最初からやり直す
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="ゲームのリセット"
        message="本当に最初からやり直しますか？現在の対局データは破棄されます。"
        confirmText="やり直す"
        cancelText="キャンセル"
        onConfirm={() => {
          initializeGame();
          setIsConfirmModalOpen(false);
        }}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
};

export default MeteorOthello;
