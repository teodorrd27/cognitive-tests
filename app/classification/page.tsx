'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProgressBar from '@/components/ProgressBar'

const ALL_QUESTIONS = [
  { image: 1,  choices: ['Hot Air Balloon', 'Horse', 'Ship', 'Dog'],         answers: ['Hot Air Balloon', 'Horse', 'Dog'] },
  { image: 2,  choices: ['Tea pot', 'Umbrella', 'Bird', 'Ship'],             answers: ['Umbrella', 'Ship'] },
  { image: 3,  choices: ['Bullock Cart', 'Train', 'Barrel', 'Chicken'],      answers: ['Bullock Cart', 'Train', 'Barrel'] },
  { image: 4,  choices: ['Dog', 'Umbrella', 'Clock', 'Coat'],                answers: ['Umbrella', 'Clock', 'Coat'] },
  { image: 5,  choices: ['Horse', 'Fishing rod', 'Bird', 'Umbrella'],        answers: ['Fishing rod', 'Umbrella'] },
  { image: 6,  choices: ['Violin', 'Horse', 'Table', 'Basket'],              answers: ['Horse'] },
  { image: 7,  choices: ['Book', 'Table', 'Wine Bottle', 'Bridge'],          answers: ['Table', 'Wine Bottle'] },
  { image: 8,  choices: ['Notice', 'Broom', 'Cat', 'Mirror'],                answers: ['Notice'] },
  { image: 9,  choices: ['Cows', 'Castle', 'Cat', 'Axe'],                   answers: ['Castle', 'Axe'] },
  { image: 10, choices: ['Bottle', 'Infant', 'Dog', 'Tea pot'],              answers: ['Infant'] },
  { image: 11, choices: ['Birds', 'Barrel', 'Horse', 'Chicken'],             answers: ['Birds', 'Barrel'] },
  { image: 12, choices: ['Cat', 'Doll', 'Cow', 'Umbrella'],                 answers: ['Doll', 'Cow'] },
  { image: 13, choices: ['Piano', 'Clock', 'Dog', 'Fan'],                   answers: ['Piano', 'Clock', 'Fan'] },
  { image: 14, choices: ['Flag', 'Bird', 'Sword', 'Ship'],                  answers: ['Sword', 'Ship'] },
  { image: 15, choices: ['Ship', 'Dancers', 'Pond', 'Fire'],                answers: ['Dancers', 'Pond'] },
  { image: 16, choices: ['Dog', 'Donkey', 'Cart', 'Stairway'],              answers: ['Donkey', 'Stairway'] },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Result { correct: boolean; selected: string[]; answers: string[] }

export default function ClassificationTask() {
  const [questions] = useState(() => shuffle(ALL_QUESTIONS))
  const [index, setIndex] = useState(-1) // -1 = instructions
  const [selected, setSelected] = useState<string[]>([])
  const [results, setResults] = useState<Result[]>([])

  const toggleOption = (opt: string) => {
    setSelected(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt])
  }

  const submit = () => {
    const q = questions[index]
    const sortedSelected = [...selected].sort().join('+')
    const sortedAnswers = [...q.answers].sort().join('+')
    const correct = sortedSelected === sortedAnswers
    setResults(prev => [...prev, { correct, selected, answers: q.answers }])
    setSelected([])
    setIndex(prev => prev + 1)
  }

  if (index === -1) {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <p><strong>Instructions</strong></p>
        <p className="mt-4">In this task, you will see a painting and a list of items.</p>
        <p className="mt-2">Select all the items that appear on the painting.</p>
        <button className="mt-8 px-6 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setIndex(0)}>Continue</button>
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
      <div className="relative w-full h-72 mb-6">
        <Image src={`/classification/${q.image}.jpg`} alt="painting" fill className="object-contain" />
      </div>
      <p className="font-medium mb-4">Which of these items do you see in the painting shown above?</p>
      <div className="flex flex-wrap gap-3 mb-6">
        {q.choices.map(opt => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggleOption(opt)}
              className="w-4 h-4"
            />
            {opt}
          </label>
        ))}
      </div>
      <button className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={submit}>Next</button>
    </div>
  )
}
