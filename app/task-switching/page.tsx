'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import ProgressBar from '@/components/ProgressBar'

type Phase = 'instructions' | 'example' | 'gap' | 'trial' | 'done'
type StimulusType = 'initial' | 'repeat' | 'switch'

interface Trial {
  text: string
  position: 0 | 1 | 2 | 3   // 0=top-left, 1=top-right, 2=bottom-left, 3=bottom-right
  correctKey: 'y' | 'n'
  stimulusType: StimulusType
}

const TRIALS: Trial[] = [
  { text: 'O 3', position: 3, correctKey: 'y', stimulusType: 'initial'  },
  { text: 'K 8', position: 2, correctKey: 'n', stimulusType: 'repeat'   },
  { text: 'J 6', position: 1, correctKey: 'y', stimulusType: 'switch'   },
  { text: 'G 6', position: 0, correctKey: 'y', stimulusType: 'repeat'   },
  { text: 'O 1', position: 0, correctKey: 'n', stimulusType: 'repeat'   },
  { text: 'J 2', position: 2, correctKey: 'n', stimulusType: 'switch'   },
  { text: 'K 2', position: 1, correctKey: 'y', stimulusType: 'switch'   },
  { text: 'G 6', position: 3, correctKey: 'n', stimulusType: 'switch'   },
  { text: 'I 1', position: 3, correctKey: 'y', stimulusType: 'repeat'   },
  { text: 'A 7', position: 2, correctKey: 'y', stimulusType: 'repeat'   },
  { text: 'H 4', position: 2, correctKey: 'n', stimulusType: 'repeat'   },
  { text: 'I 3', position: 1, correctKey: 'n', stimulusType: 'switch'   },
  { text: 'H 8', position: 0, correctKey: 'y', stimulusType: 'repeat'   },
  { text: 'E 5', position: 3, correctKey: 'y', stimulusType: 'switch'   },
  { text: 'E 3', position: 0, correctKey: 'n', stimulusType: 'switch'   },
  { text: 'A 7', position: 1, correctKey: 'n', stimulusType: 'repeat'   },
  { text: 'O 3', position: 3, correctKey: 'y', stimulusType: 'switch'   },
]

interface TrialResult {
  stimulusType: StimulusType
  correct: boolean
  rt: number | null
}

function BoxGrid({ text, position }: { text: string; position: number }) {
  return (
    <div style={{ width: 180, height: 180, display: 'inline-block' }}>
      {[0, 1, 2, 3].map(k => (
        <div
          key={k}
          style={{
            width: '50%',
            height: '50%',
            float: 'left' as const,
            background: '#ddd',
            textAlign: 'center',
            lineHeight: '90px',
            fontSize: '2em',
            borderLeft: k === 1 || k === 3 ? '1px solid #000' : undefined,
            borderTop: k === 2 || k === 3 ? '1px solid #000' : undefined,
          }}
        >
          {k === position ? text : ''}
        </div>
      ))}
    </div>
  )
}

export default function TaskSwitchingTest() {
  const [phase, setPhase] = useState<Phase>('instructions')
  const [trialIndex, setTrialIndex] = useState(0)
  const [results, setResults] = useState<TrialResult[]>([])
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const trialStart = useRef<number>(0)
  const responded = useRef(false)

  const startTrial = useCallback((index: number) => {
    if (index >= TRIALS.length) { setPhase('done'); return }
    setTrialIndex(index)
    setPhase('trial')
    trialStart.current = performance.now()
    responded.current = false
    timerRef.current = setTimeout(() => {
      setResults(prev => [...prev, { stimulusType: TRIALS[index].stimulusType, correct: false, rt: null }])
      setProgress((index + 1) / TRIALS.length * 0.4)
      setPhase('gap')
      timerRef.current = setTimeout(() => startTrial(index + 1), 500)
    }, 3500)
  }, [])

  // Example: wait for 'n'
  useEffect(() => {
    if (phase !== 'example') return
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'n') { e.preventDefault(); startTrial(0) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, startTrial])

  useEffect(() => {
    if (phase !== 'trial') return
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (!['y', 'n'].includes(key) || responded.current) return
      e.preventDefault()
      responded.current = true
      if (timerRef.current) clearTimeout(timerRef.current)
      const rt = performance.now() - trialStart.current
      const correct = key === TRIALS[trialIndex].correctKey
      setResults(prev => [...prev, { stimulusType: TRIALS[trialIndex].stimulusType, correct, rt }])
      setProgress((trialIndex + 1) / TRIALS.length * 0.4)
      setPhase('gap')
      timerRef.current = setTimeout(() => startTrial(trialIndex + 1), 500)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, trialIndex, startTrial])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const byType = (type: StimulusType) => results.filter(r => r.stimulusType === type)
  const pct = (arr: TrialResult[]) => arr.length ? Math.round(100 * arr.filter(r => r.correct).length / arr.length) : 0
  const mean = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  const rt = (arr: TrialResult[]) => Math.round(mean(arr.filter(r => r.rt !== null).map(r => r.rt!)))

  if (phase === 'instructions') {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <p><strong>Instructions</strong></p>
        <p className="mt-4">In this test, you will see four boxes and a <strong>letter/number</strong> combination, such as <strong>K2</strong> on one of the boxes.</p>
        <p className="mt-2">If it appear on the top two boxes, you need to quickly respond to the letter and press <strong>Y</strong> if the letter is constant (G,H,J,K) or press <strong>N</strong> if it is a vowel (A,E,I,O)</p>
        <p className="mt-2">if it appear on the bottom two boxes, you need to respond to the number and press <strong>Y</strong> if the letter is odd (1,3,5,7) or press <strong>N</strong> if it is even (2,4,6,8)</p>
        <p className="mt-2">Next, you will see an example.</p>
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
        <p><strong>Example</strong></p>
        <div className="my-6 flex justify-center">
          <BoxGrid text="K 2" position={3} />
        </div>
        <p>Since it appear on the bottom, you need to consider the number and press <strong>N</strong> since 2 is even.</p>
        <p className="mt-2">Press N to begin</p>
      </div>
    )
  }

  if (phase === 'gap') {
    return (
      <div className="max-w-xl text-center px-6 py-12 w-full">
        <ProgressBar value={progress} />
      </div>
    )
  }

  if (phase === 'trial') {
    const trial = TRIALS[trialIndex]
    return (
      <div className="max-w-xl text-center px-6 py-12 w-full">
        <ProgressBar value={progress} />
        <div className="flex justify-center my-6">
          <BoxGrid text={trial.text} position={trial.position} />
        </div>
        <p>press <strong>Y</strong> for odd or <strong>N</strong> for even or <strong>Y</strong> for constant or <strong>N</strong> for vowel</p>
      </div>
    )
  }

  // done
  const rep = byType('repeat')
  const sw = byType('switch')
  return (
    <div className="max-w-xl text-center px-6 py-12">
      <p><strong>Results</strong></p>
      <p className="mt-4">Repeat trials: {pct(rep)}% correct, {rt(rep)}ms avg RT</p>
      <p className="mt-2">Switch trials: {pct(sw)}% correct, {rt(sw)}ms avg RT</p>
      <Link href="/" className="mt-8 inline-block px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">Back to tests</Link>
    </div>
  )
}
