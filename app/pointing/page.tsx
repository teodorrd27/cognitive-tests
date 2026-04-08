'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProgressBar from '@/components/ProgressBar'

type Phase = 'instructions' | 'example' | 'round-intro' | 'trial' | 'done'

// Each round: list of [row, col] star positions (shuffled each time)
const ROUND_TARGETS: [number, number][][] = [
  [[0, 2], [1, 1], [3, 2]],
  [[2, 0], [3, 3], [2, 2], [4, 2]],
  [[1, 4], [1, 1], [3, 0], [4, 2], [0, 2]],
  [[2, 3], [2, 4], [4, 2], [1, 2], [1, 0], [4, 1], [3, 1]],
  [[1, 2], [3, 3], [3, 2], [4, 0], [0, 0], [0, 3], [1, 4], [3, 4]],
]

interface CellState {
  isTarget: boolean
  clicked: boolean
  found: boolean
  isError: boolean
}

interface RoundResult {
  errors: number
  accuracy: number
  rt: number
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function PointingTest() {
  const [phase, setPhase] = useState<Phase>('instructions')
  const [round, setRound] = useState(0)
  const [targets, setTargets] = useState<[number, number][]>([])
  const [currentTargetIdx, setCurrentTargetIdx] = useState(0)
  const [grid, setGrid] = useState<CellState[][]>([])
  const [foundCells, setFoundCells] = useState<[number, number][]>([])
  const [clickedCells, setClickedCells] = useState<[number, number][]>([])
  const [errors, setErrors] = useState(0)
  const [results, setResults] = useState<RoundResult[]>([])
  const [progress, setProgress] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackCell, setFeedbackCell] = useState<{ row: number; col: number; color: string } | null>(null)
  const roundStart = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const initRound = useCallback((roundIdx: number) => {
    const shuffledTargets = shuffle(ROUND_TARGETS[roundIdx])
    const newGrid: CellState[][] = Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => ({ isTarget: false, clicked: false, found: false, isError: false }))
    )
    shuffledTargets.forEach(([r, c]) => { newGrid[r][c].isTarget = true })
    setTargets(shuffledTargets)
    setCurrentTargetIdx(0)
    setGrid(newGrid)
    setFoundCells([])
    setClickedCells([])
    setErrors(0)
    setFeedbackCell(null)
    setShowFeedback(false)
    roundStart.current = performance.now()
    setPhase('trial')
  }, [])

  const startRound = useCallback((roundIdx: number) => {
    setRound(roundIdx)
    setPhase('round-intro')
    timerRef.current = setTimeout(() => initRound(roundIdx), 1000)
  }, [initRound])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (showFeedback) return

    setGrid(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })))
      const cell = next[row][col]
      const currentTarget = targets[currentTargetIdx]
      const isCurrentTarget = row === currentTarget[0] && col === currentTarget[1]

      let color = '#898c8d'
      let newError = false

      if (isCurrentTarget) {
        color = '#5cb85c'
        cell.found = true
      } else {
        // Check if revisiting a found cell or already-clicked cell
        const wasFound = foundCells.some(([r, c]) => r === row && c === col)
        const wasClicked = clickedCells.some(([r, c]) => r === row && c === col)
        if (wasFound || wasClicked) {
          color = '#d9534f'
          newError = true
        }
      }

      setFeedbackCell({ row, col, color })
      setShowFeedback(true)

      timerRef.current = setTimeout(() => {
        setShowFeedback(false)
        setFeedbackCell(null)

        if (isCurrentTarget) {
          setFoundCells(prev => [...prev, [row, col]])
          setClickedCells([])
          const nextIdx = currentTargetIdx + 1
          setCurrentTargetIdx(nextIdx)

          if (nextIdx >= targets.length) {
            // Round complete
            const rt = performance.now() - roundStart.current
            const totalErrors = errors + (newError ? 1 : 0)
            const acc = Math.max((1 - totalErrors / 3) * (1 / targets.length), 0)
            // We calculate per the original: accuracy per target capped at 0
            const roundResult: RoundResult = { errors: totalErrors, accuracy: acc, rt }
            setResults(prev => {
              const newResults = [...prev, roundResult]
              setProgress(newResults.length / ROUND_TARGETS.length * 0.4)
              return newResults
            })
            const nextRound = round + 1
            if (nextRound >= ROUND_TARGETS.length) {
              setPhase('done')
            } else {
              startRound(nextRound)
            }
          }
        } else {
          if (newError) {
            setErrors(prev => prev + 1)
          } else {
            setClickedCells(prev => [...prev, [row, col]])
          }
        }
      }, 500)

      return next
    })
  }, [showFeedback, targets, currentTargetIdx, foundCells, clickedCells, errors, round, startRound])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const getCellColor = (row: number, col: number): string => {
    if (feedbackCell && feedbackCell.row === row && feedbackCell.col === col) {
      return feedbackCell.color
    }
    const wasFound = foundCells.some(([r, c]) => r === row && c === col)
    if (wasFound) return '#5cb85c'
    return '#e5e7eb'
  }

  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0)
  const avgAccuracy = results.length
    ? results.reduce((sum, r) => sum + r.accuracy, 0) / results.length
    : 0

  if (phase === 'instructions') {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <p><strong>Instructions</strong></p>
        <p className="mt-4">In this test you have to search a set of boxes by clicking them, until you find a star (★). While searching you should not click the same box twice. Once you find the star, it will be hidden in another box and you could repeat the search. Stars will not appear on the same box again, therefore you need to remember where you found each star and avoid clicking those boxes.</p>
        <p className="mt-4">When you click on a box, if the box contains a star it will turn <strong>green</strong> for a brief time and show the star. If not it will turn into either <strong>gray</strong> if its empty or <strong>red</strong> if you have made a mistake.</p>
        <p className="mt-4">You will see an example next</p>
        <button
          className="mt-8 px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setPhase('example')}
        >
          Continue
        </button>
      </div>
    )
  }

  if (phase === 'example') {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <Image src="/pointing-example.gif" alt="example" width={300} height={300} className="mx-auto" unoptimized />
        <button
          className="mt-8 px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => startRound(0)}
        >
          Start
        </button>
      </div>
    )
  }

  if (phase === 'round-intro') {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <ProgressBar value={progress} />
        <p><strong>Round {round + 1}</strong></p>
      </div>
    )
  }

  if (phase === 'trial') {
    return (
      <div className="max-w-xl text-center px-6 py-12 w-full">
        <ProgressBar value={progress} />
        <p className="mb-4 font-semibold">Round {round + 1} — Find the stars in order</p>
        <div className="inline-block">
          {Array.from({ length: 5 }, (_, row) => (
            <div key={row} className="flex">
              {Array.from({ length: 5 }, (_, col) => {
                const color = getCellColor(row, col)
                const isCurrentTarget = targets[currentTargetIdx]?.[0] === row && targets[currentTargetIdx]?.[1] === col
                const wasFound = foundCells.some(([r, c]) => r === row && c === col)
                return (
                  <button
                    key={col}
                    onClick={() => handleCellClick(row, col)}
                    disabled={showFeedback}
                    style={{ backgroundColor: color }}
                    className="w-14 h-14 border border-gray-400 text-2xl flex items-center justify-center transition-colors duration-200"
                  >
                    {(color === '#5cb85c' && !wasFound) ? '★' : ''}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // done
  return (
    <div className="max-w-xl text-center px-6 py-12">
      <p><strong>Results</strong></p>
      <p className="mt-4">Total errors: {totalErrors}</p>
      <p className="mt-2">Average accuracy: {Math.round(avgAccuracy * 100)}%</p>
      <Link href="/" className="mt-8 inline-block px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">Back to tests</Link>
    </div>
  )
}
