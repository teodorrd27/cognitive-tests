'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import ProgressBar from '@/components/ProgressBar'

type StimulusType = 'congruent' | 'incongruent' | 'unrelated'
type Phase = 'instructions' | 'example' | 'fixation' | 'trial' | 'done'

interface Trial {
  word: string
  color: string
  stimulusType: StimulusType
  correctKey: string
}

const BASE_TRIALS: Trial[] = [
  { word: 'SHIP',   color: 'red',   stimulusType: 'unrelated',   correctKey: 'r' },
  { word: 'MONKEY', color: 'green', stimulusType: 'unrelated',   correctKey: 'g' },
  { word: 'ZAMBONI',color: 'blue',  stimulusType: 'unrelated',   correctKey: 'b' },
  { word: 'RED',    color: 'red',   stimulusType: 'congruent',   correctKey: 'r' },
  { word: 'GREEN',  color: 'green', stimulusType: 'congruent',   correctKey: 'g' },
  { word: 'BLUE',   color: 'blue',  stimulusType: 'congruent',   correctKey: 'b' },
  { word: 'GREEN',  color: 'red',   stimulusType: 'incongruent', correctKey: 'r' },
  { word: 'BLUE',   color: 'green', stimulusType: 'incongruent', correctKey: 'g' },
  { word: 'RED',    color: 'blue',  stimulusType: 'incongruent', correctKey: 'b' },
]

interface TrialResult {
  stimulusType: StimulusType
  correct: boolean
  rt: number | null
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function StroopTest() {
  const [phase, setPhase] = useState<Phase>('instructions')
  const [trials] = useState<Trial[]>(() => shuffle([...BASE_TRIALS, ...BASE_TRIALS]))
  const [trialIndex, setTrialIndex] = useState(0)
  const [results, setResults] = useState<TrialResult[]>([])
  const [progress, setProgress] = useState(0)
  const trialStart = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalTrials = trials.length // 18

  const nextTrial = useCallback((result?: TrialResult) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const newResults = result ? [...results, result] : results
    const nextIndex = trialIndex + (result ? 1 : 0)

    if (nextIndex >= totalTrials) {
      setResults(newResults)
      setPhase('done')
      return
    }

    setResults(newResults)
    setTrialIndex(nextIndex)
    setProgress((nextIndex / totalTrials) * 0.4 + (result ? 0.4 / totalTrials : 0))
    setPhase('fixation')

    timerRef.current = setTimeout(() => {
      trialStart.current = performance.now()
      setPhase('trial')
      timerRef.current = setTimeout(() => {
        nextTrial({ stimulusType: trials[nextIndex].stimulusType, correct: false, rt: null })
      }, 3500)
    }, 300)
  }, [results, trialIndex, totalTrials, trials])

  // Keyboard handler during trial
  useEffect(() => {
    if (phase !== 'trial') return
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (!['r', 'g', 'b'].includes(key)) return
      const rt = performance.now() - trialStart.current
      const correct = key === trials[trialIndex].correctKey
      nextTrial({ stimulusType: trials[trialIndex].stimulusType, correct, rt })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, trialIndex, trials, nextTrial])

  // Example screen keyboard handler
  useEffect(() => {
    if (phase !== 'example') return
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        setPhase('fixation')
        timerRef.current = setTimeout(() => {
          trialStart.current = performance.now()
          setPhase('trial')
          timerRef.current = setTimeout(() => {
            nextTrial({ stimulusType: trials[0].stimulusType, correct: false, rt: null })
          }, 3500)
        }, 300)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, trials, nextTrial])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const mean = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  const byType = (type: StimulusType) => results.filter(r => r.stimulusType === type)
  const pct = (arr: TrialResult[]) => arr.length ? Math.round(100 * arr.filter(r => r.correct).length / arr.length) : 0
  const rt = (arr: TrialResult[]) => Math.round(mean(arr.filter(r => r.rt !== null).map(r => r.rt!)))

  if (phase === 'instructions') {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <p><strong>Instructions</strong></p>
        <p className="mt-4">In this experiment, a word will appear in the center of the screen.</p>
        <p className="mt-2">When the word appears respond with the <strong>color</strong> in which the word is printed as quickly as you can.</p>
        <p className="mt-2">press <strong>R</strong> for red, <strong>G</strong> for green, and <strong>B</strong> for blue.</p>
        <p className="mt-2">Next you will see an example.</p>
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
        <p>&nbsp;</p>
        <p style={{ fontSize: 70, color: 'red', lineHeight: '70px' }}>BLUE</p>
        <p>&nbsp;</p>
        <p>Here you need to press <strong>R</strong> for red which is the color of the given word.</p>
        <p>Press R to begin.</p>
      </div>
    )
  }

  if (phase === 'fixation') {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <ProgressBar value={progress} />
        <p style={{ fontSize: 50 }}>+</p>
      </div>
    )
  }

  if (phase === 'trial') {
    const trial = trials[trialIndex]
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <ProgressBar value={progress} />
        <p style={{ fontSize: 70, color: trial.color }}>{trial.word}</p>
      </div>
    )
  }

  // done
  const con = byType('congruent')
  const inc = byType('incongruent')
  const unr = byType('unrelated')
  return (
    <div className="max-w-xl text-center px-6 py-12">
      <p>Your average response time on congruent trials was {rt(con)}ms. Your average response time on incongruent trials was {rt(inc)}ms. Your average response time on unrelated trials was {rt(unr)}ms.</p>
      <p className="mt-4">Your average percent correct on congruent trials was {pct(con)}%. Your average percent correct on incongruent trials was {pct(inc)}%. Your average percent correct on unrelated trials was {pct(unr)}%.</p>
      <p className="mt-4">Thanks for participating!</p>
      <Link href="/" className="mt-8 inline-block px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">Back to tests</Link>
    </div>
  )
}
