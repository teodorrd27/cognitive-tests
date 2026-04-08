'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ProgressBar from '@/components/ProgressBar'

type Direction = 'left' | 'right'
type StimulusType = 'congruent' | 'incongruent'
type Phase = 'instructions' | 'trial' | 'gap' | 'done'

interface Stimulus {
  src: string
  stimulusType: StimulusType
  direction: Direction
}

const BASE_STIMULI: Stimulus[] = [
  { src: '/flanker/con1.png', stimulusType: 'congruent',   direction: 'left'  },
  { src: '/flanker/con2.png', stimulusType: 'congruent',   direction: 'right' },
  { src: '/flanker/inc1.png', stimulusType: 'incongruent', direction: 'right' },
  { src: '/flanker/inc2.png', stimulusType: 'incongruent', direction: 'left'  },
]

interface TrialResult {
  stimulusType: StimulusType
  correct: boolean
  rt: number | null
}

function buildTrials(): Stimulus[] {
  const all = [...BASE_STIMULI, ...BASE_STIMULI, ...BASE_STIMULI, ...BASE_STIMULI]
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]]
  }
  return all
}

export default function FlankerTest() {
  const [phase, setPhase] = useState<Phase>('instructions')
  const [trials] = useState<Stimulus[]>(() => buildTrials())
  const [trialIndex, setTrialIndex] = useState(0)
  const [results, setResults] = useState<TrialResult[]>([])
  const [progress, setProgress] = useState(0)
  const trialStart = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const totalTrials = trials.length // 16

  const startTrial = useCallback((index: number) => {
    if (index >= totalTrials) { setPhase('done'); return }
    trialStart.current = performance.now()
    setTrialIndex(index)
    setPhase('trial')
    timerRef.current = setTimeout(() => {
      // timeout — no response
      setResults(prev => [...prev, { stimulusType: trials[index].stimulusType, correct: false, rt: null }])
      const gap = Math.floor(Math.random() * 500) + 500
      setPhase('gap')
      setProgress((index + 1) / totalTrials * 0.4)
      timerRef.current = setTimeout(() => startTrial(index + 1), gap)
    }, 3500)
  }, [totalTrials, trials])

  useEffect(() => {
    if (phase !== 'trial') return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault()
      if (timerRef.current) clearTimeout(timerRef.current)
      const rt = performance.now() - trialStart.current
      const dir = e.key === 'ArrowLeft' ? 'left' : 'right'
      const correct = dir === trials[trialIndex].direction
      setResults(prev => [...prev, { stimulusType: trials[trialIndex].stimulusType, correct, rt }])
      const gap = Math.floor(Math.random() * 500) + 500
      setPhase('gap')
      setProgress((trialIndex + 1) / totalTrials * 0.4)
      timerRef.current = setTimeout(() => startTrial(trialIndex + 1), gap)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, trialIndex, trials, startTrial, totalTrials])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const mean = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  const byType = (type: StimulusType) => results.filter(r => r.stimulusType === type)
  const pct = (arr: TrialResult[]) => arr.length ? Math.round(100 * arr.filter(r => r.correct).length / arr.length) : 0
  const rt = (arr: TrialResult[]) => Math.round(mean(arr.filter(r => r.rt !== null).map(r => r.rt!)))

  // Start on right arrow from instructions
  useEffect(() => {
    if (phase !== 'instructions') return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); startTrial(0) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, startTrial])

  if (phase === 'instructions') {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <p><strong>Instructions</strong></p>
        <p className="mt-4">In this task, you will see five arrows on the screen, like the example below.</p>
        <Image src="/flanker/inc1.png" alt="example" width={200} height={60} className="mx-auto my-4" />
        <p>Press the left arrow key if the middle arrow is pointing left. (&lt;)</p>
        <p className="mt-2">Press the right arrow key if the middle arrow is pointing right. (&gt;)</p>
        <p className="mt-4">Press the right arrow key to start</p>
      </div>
    )
  }

  if (phase === 'gap') {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <ProgressBar value={progress} />
      </div>
    )
  }

  if (phase === 'trial') {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <ProgressBar value={progress} />
        <Image
          src={trials[trialIndex].src}
          alt="arrows"
          width={300}
          height={80}
          className="mx-auto"
          priority
        />
      </div>
    )
  }

  // done
  const con = byType('congruent')
  const inc = byType('incongruent')
  return (
    <div className="max-w-xl text-center px-6 py-12">
      <p><strong>Results</strong></p>
      <p className="mt-4">Congruent: {pct(con)}% correct, {rt(con)}ms avg RT</p>
      <p className="mt-2">Incongruent: {pct(inc)}% correct, {rt(inc)}ms avg RT</p>
      <Link href="/" className="mt-8 inline-block px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">Back to tests</Link>
    </div>
  )
}
