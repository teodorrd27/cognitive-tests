'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProgressBar from '@/components/ProgressBar'

// correct_response: 0=Positive, 1=Neutral, 2=Negative
const ALL_TRIALS = [
  { sentence: 'My internet provider does a great job when it comes to stealing money from me', correct: 2 },
  { sentence: 'The only downside of this restaurant is that it charges me too little for its service.', correct: 0 },
  { sentence: 'Can you recommend a good tool I could use?', correct: 1 },
  { sentence: 'This browser uses a lot of memory.', correct: 2 },
  { sentence: "Absolutely adore it when my bus is late.", correct: 2 },
  { sentence: "I'm so pleased road construction woke me up with a bang.", correct: 2 },
  { sentence: 'The new album is so sick.', correct: 0 },
  { sentence: 'That was such a wicked performance by him at the concert.', correct: 0 },
  { sentence: 'The weather is great today!', correct: 0 },
  { sentence: 'The lecture was very informative.', correct: 0 },
  { sentence: 'My friends think the price is too expensive.', correct: 2 },
  { sentence: "I'm loving it so far.", correct: 0 },
  { sentence: "I've just finished my work.", correct: 1 },
  { sentence: "He's been useless to the team so far.", correct: 2 },
  { sentence: 'I hate it when she acts like that.', correct: 2 },
  { sentence: 'The keys are on the table.', correct: 1 },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const LABELS = ['Positive', 'Neutral', 'Negative']

interface Result { correct: boolean; response: number; expected: number }

export default function SentimentTask() {
  const [trials] = useState(() => shuffle(ALL_TRIALS))
  const [index, setIndex] = useState(-1)
  const [results, setResults] = useState<Result[]>([])

  const respond = (choice: number) => {
    const correct = choice === trials[index].correct
    setResults(prev => [...prev, { correct, response: choice, expected: trials[index].correct }])
    setIndex(prev => prev + 1)
  }

  if (index === -1) {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <p><strong>Instructions</strong></p>
        <p className="mt-4">In this task, you need to identify the sentiment of a sentence (i.e., point of view, opinion). A sentence&apos;s sentiment will be classified as either <strong>&apos;negative&apos;, &apos;neutral&apos;,</strong> or <strong>&apos;positive&apos;</strong>.</p>
        <p className="mt-2">Click the relevant button to provide your answer</p>
        <button className="mt-8 px-6 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setIndex(0)}>Start</button>
      </div>
    )
  }

  if (index >= trials.length) {
    const correct = results.filter(r => r.correct).length
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <p><strong>Results</strong></p>
        <p className="mt-4">{correct} / {results.length} correct</p>
        <Link href="/" className="mt-8 inline-block px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">Back to tests</Link>
      </div>
    )
  }

  return (
    <div className="max-w-xl w-full px-6 py-8">
      <ProgressBar value={index / trials.length} />
      <p className="text-lg mb-8 text-center">{trials[index].sentence}</p>
      <div className="flex justify-center gap-4">
        <button onClick={() => respond(0)} className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">Positive</button>
        <button onClick={() => respond(1)} className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">Neutral</button>
        <button onClick={() => respond(2)} className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">Negative</button>
      </div>
    </div>
  )
}
