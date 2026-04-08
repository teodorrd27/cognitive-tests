'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import ProgressBar from '@/components/ProgressBar'

type Phase = 'instructions' | 'pre-trial' | 'trial' | 'feedback' | 'done'
type Indicator = 'none' | 'correct' | 'wrong'

const PRE_TRIALS = ['L', 'F', 'G']

const TRIALS: { letter: string; answer: 'y' | 'n' }[] = [
  { letter: 'K', answer: 'n' },
  { letter: 'F', answer: 'y' },
  { letter: 'L', answer: 'n' },
  { letter: 'K', answer: 'y' },
  { letter: 'M', answer: 'n' },
  { letter: 'F', answer: 'n' },
  { letter: 'K', answer: 'y' },
  { letter: 'M', answer: 'y' },
  { letter: 'M', answer: 'n' },
  { letter: 'F', answer: 'n' },
  { letter: 'M', answer: 'y' },
  { letter: 'L', answer: 'n' },
  { letter: 'K', answer: 'n' },
  { letter: 'M', answer: 'y' },
  { letter: 'L', answer: 'y' },
  { letter: 'K', answer: 'y' },
]

interface TrialResult {
  correct: boolean
  rt: number | null
}

export default function NBackTest() {
  const [phase, setPhase] = useState<Phase>('instructions')
  const [preIndex, setPreIndex] = useState(0)
  const [trialIndex, setTrialIndex] = useState(0)
  const [indicator, setIndicator] = useState<Indicator>('none')
  const [results, setResults] = useState<TrialResult[]>([])
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const trialStart = useRef<number>(0)
  const responded = useRef(false)

  const runPreTrials = useCallback((index: number) => {
    if (index >= PRE_TRIALS.length) {
      setPhase('trial')
      setTrialIndex(0)
      trialStart.current = performance.now()
      responded.current = false
      return
    }
    setPreIndex(index)
    setPhase('pre-trial')
    timerRef.current = setTimeout(() => runPreTrials(index + 1), 2300) // 2000 + 300
  }, [])

  const runTrial = useCallback((index: number) => {
    if (index >= TRIALS.length) { setPhase('done'); return }
    setTrialIndex(index)
    setIndicator('none')
    setPhase('trial')
    trialStart.current = performance.now()
    responded.current = false
    timerRef.current = setTimeout(() => {
      // no response
      setResults(prev => [...prev, { correct: false, rt: null }])
      setProgress((index + 1) / TRIALS.length * 0.4)
      setIndicator('none')
      setPhase('feedback')
      timerRef.current = setTimeout(() => runTrial(index + 1), 300)
    }, 3500)
  }, [])

  useEffect(() => {
    if (phase !== 'trial') return
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (!['y', 'n'].includes(key) || responded.current) return
      responded.current = true
      if (timerRef.current) clearTimeout(timerRef.current)
      const rt = performance.now() - trialStart.current
      const correct = key === TRIALS[trialIndex].answer
      setResults(prev => [...prev, { correct, rt }])
      setProgress((trialIndex + 1) / TRIALS.length * 0.4)
      setIndicator(correct ? 'correct' : 'wrong')
      setPhase('feedback')
      timerRef.current = setTimeout(() => runTrial(trialIndex + 1), 300)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, trialIndex, runTrial])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const totalCorrect = results.filter(r => r.correct).length
  const accuracy = results.length ? Math.round(100 * totalCorrect / results.length) : 0
  const validRTs = results.filter(r => r.rt !== null).map(r => r.rt!)
  const avgRT = validRTs.length ? Math.round(validRTs.reduce((a, b) => a + b, 0) / validRTs.length) : 0

  const indicatorColor =
    indicator === 'correct' ? '#5cb85c' :
    indicator === 'wrong'   ? '#d9534f' : '#dddddd'

  if (phase === 'instructions') {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <p><strong>Instructions</strong></p>
        <p className="mt-4">In this test, you will see a sequence of letters. Each letter is shown for few seconds.</p>
        <p className="mt-2">You need to decide if you saw the same letter 3 trials ago and press <strong>Y</strong> for yes or <strong>N</strong> for no.</p>
        <p className="mt-2">For each response, you will get feedback with a green indicator for correct or red for incorrect.</p>
        <p className="mt-2">Start responding from the third letter onwards. Press any key to start the test.</p>
        <button
          className="mt-8 px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => runPreTrials(0)}
        >
          Continue
        </button>
      </div>
    )
  }

  const currentLetter = phase === 'pre-trial'
    ? PRE_TRIALS[preIndex]
    : TRIALS[trialIndex]?.letter ?? ''

  return (
    <div className="max-w-xl text-center px-6 py-12 w-full">
      {(phase === 'trial' || phase === 'feedback') && <ProgressBar value={progress} />}
      <div style={{ height: 180, textAlign: 'center', verticalAlign: 'middle' }}>
        <div style={{
          height: 180,
          textAlign: 'center',
          lineHeight: '180px',
          fontSize: '5em'
        }}>
          {currentLetter}
        </div>
        <div style={{
          height: 30,
          backgroundColor: indicatorColor,
          transition: 'background-color 0.1s'
        }} />
      </div>
      {phase === 'done' && (
        <div className="mt-8">
          <p>Accuracy: {accuracy}% ({totalCorrect}/{results.length} correct)</p>
          <p className="mt-2">Average response time: {avgRT}ms</p>
          <Link href="/" className="mt-6 inline-block px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">Back to tests</Link>
        </div>
      )}
    </div>
  )
}
