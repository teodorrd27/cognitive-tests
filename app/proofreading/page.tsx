'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProgressBar from '@/components/ProgressBar'

const ALL_TRIALS = [
  { prompt: 'The place was not only pleasent, but perfect, if once he could regard it not as a deception but rather as a dream', correct: 'pleasant' },
  { prompt: 'More especially this attractive unreality fell upon it about nightfall, when the extravagant roofs were dark against the afterglow and the whole insane village seemed as seperate as a drifting cloud.', correct: 'separate' },
  { prompt: 'For a time the Major showed an inclination to discourage the advances of the "play actor," as he privately termed him; but soon the young man\'s agreeable manner and indubitable appreciation of the old gentlemans stories completely won him over.', correct: "gentleman's" },
  { prompt: "Your mysterious young friend, who's name you have never told me, but whose picture really fascinates me, never thinks. I feel quite sure of that.", correct: 'whose' },
  { prompt: 'The place stood back from the road, half hidden among the trees, though which glimpses could be caught of the wide cool veranda that ran around its four sides.', correct: 'through' },
  { prompt: 'Though we are not so degenerate but that we might possibly live in a cave or a wigwam or wear skins today, it certainly is better to except the advantages, though so dearly bought, which the invention and industry of mankind offer.', correct: 'accept' },
  { prompt: 'Well, of course the war has turned the hundreds into thousands. No doubt the fellow was very useful to here. But you could have knocked us all down with a feather when, three months ago, she suddenly announced that she and Alfred were engaged!', correct: 'her' },
  { prompt: 'he was keeping it in the coal-cellar with a select party of two other young gentleman, who, after participating with him in a sound thrashing, had been looked up for atrociously presuming to be hungry.', correct: 'locked' },
  { prompt: "It's physical condition is still largely a mystery, but we know now that even in its equatorial region the midday temperature barely approaches that of our coldest winter.", correct: 'Its' },
  { prompt: 'Holmes, who loathed every form of society with his whose Bohemian soul, remained in our lodgings in Baker Street, buried among his old books.', correct: 'whole' },
  { prompt: 'The studio was filled with the rich odor of roses, and when the light summer wind stirred amidst the trees of the garden, there came through the open door the heavy scent of the lilac, or the more delicate perfume of the pink-flowering thorn.', correct: '' },
  { prompt: 'Lord Henry elevated his eyebrows and looked at him in amazement through the thin blue wreaths of smoke that curled up in such fanciful whorls from his heavy, opium-tainted cigarette.', correct: '' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Result { correct: boolean; response: string; expected: string }

export default function ProofreadingTask() {
  const [trials] = useState(() => shuffle(ALL_TRIALS))
  const [index, setIndex] = useState(-1)
  const [value, setValue] = useState('')
  const [results, setResults] = useState<Result[]>([])

  const submit = () => {
    const t = trials[index]
    const correct = value.trim() === t.correct
    setResults(prev => [...prev, { correct, response: value.trim(), expected: t.correct }])
    setValue('')
    setIndex(prev => prev + 1)
  }

  if (index === -1) {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <p><strong>Instructions</strong></p>
        <p className="mt-4">In this task you will see text. You need to identify if the given text has a mistake (misspelled word, incorrect word etc.) and <strong>type the correct word that should replace the incorrect word.</strong> Leave the input box blank if there is no mistake.</p>
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
    <div className="max-w-2xl w-full px-6 py-8">
      <ProgressBar value={index / trials.length} />
      <p className="text-base leading-relaxed mb-8">{trials[index].prompt}</p>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        autoFocus
        placeholder="Type the correct word (or leave blank if no mistake)"
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 mb-4"
      />
      <button className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={submit}>Next</button>
    </div>
  )
}
