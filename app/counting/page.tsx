'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProgressBar from '@/components/ProgressBar'

const IMAGES =           [1,  2,  3,  4,  5,  6,  10, 15, 20, 25, 30, 35]
const CORRECT_RESPONSES = [2,  3,  4,  5,  6,  6,  11, 9,  18, 13, 24, 16]

const ALL_QUESTIONS = IMAGES.map((img, i) => ({ image: img, correct: CORRECT_RESPONSES[i], index: i }))

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Result { correct: boolean; response: number; expected: number }

export default function CountingTask() {
  const [questions] = useState(() => shuffle(ALL_QUESTIONS))
  const [index, setIndex] = useState(-1)
  const [value, setValue] = useState('')
  const [results, setResults] = useState<Result[]>([])

  const submit = () => {
    const q = questions[index]
    const response = parseInt(value, 10)
    setResults(prev => [...prev, { correct: response === q.correct, response, expected: q.correct }])
    setValue('')
    setIndex(prev => prev + 1)
  }

  if (index === -1) {
    return (
      <div className="max-w-2xl px-6 py-12">
        <p className="text-center"><strong>Instructions</strong></p>
        <p className="mt-4">In this task you need to count malaria-infected blood cells on images of a petri dish using following guidelines.</p>
        <div className="mt-4 space-y-3 text-left">
          <div className="flex items-center gap-4">
            <Image src="/counting/sample-1.jpg" alt="blood cell" width={60} height={60} />
            <span>Blood cell: <strong>IGNORE</strong> these.</span>
          </div>
          <div className="flex items-center gap-4">
            <Image src="/counting/sample-2.jpg" alt="ring form" width={60} height={60} />
            <span>Malaria parasite in ring-form with double chromatin dots: <strong>COUNT</strong> these.</span>
          </div>
          <div className="flex items-center gap-4">
            <Image src="/counting/sample-3.jpg" alt="other stage" width={60} height={60} />
            <span>Malaria parasite in other growth stage: <strong>IGNORE</strong> these.</span>
          </div>
        </div>
        <div className="text-center mt-8">
          <button className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setIndex(0)}>Continue</button>
        </div>
      </div>
    )
  }

  if (index >= questions.length) {
    const correct = results.filter(r => r.correct).length
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <p><strong>Results</strong></p>
        <p className="mt-4">{correct} / {results.length} correct</p>
        <Link href="/" className="mt-8 inline-block px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">Back to tests</Link>
      </div>
    )
  }

  const q = questions[index]
  return (
    <div className="max-w-2xl w-full px-6 py-8">
      <ProgressBar value={index / questions.length} />
      <div className="relative w-full h-80 mb-6">
        <Image src={`/counting/${q.image}.jpg`} alt="petri dish" fill className="object-contain" />
      </div>
      <p className="font-medium mb-3">Number of cells?</p>
      <input
        type="number"
        min={0}
        max={999}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && value !== '' && submit()}
        autoFocus
        className="border border-gray-300 rounded px-3 py-2 w-32 text-center text-lg mr-4"
      />
      <button
        className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-40"
        onClick={submit}
        disabled={value === ''}
      >
        Next
      </button>
    </div>
  )
}
