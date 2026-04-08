'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProgressBar from '@/components/ProgressBar'

const ALL_IMAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function TranscriptionTask() {
  const [images] = useState(() => shuffle(ALL_IMAGES))
  const [index, setIndex] = useState(-2) // -2 = instructions, -1 = example
  const [value, setValue] = useState('')
  const [count, setCount] = useState(0)

  const submit = () => {
    setValue('')
    setCount(prev => prev + 1)
    setIndex(prev => prev + 1)
  }

  if (index === -2) {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <p><strong>Instructions</strong></p>
        <p className="mt-4">In this task you will see images extracted from George Washington Papers at Manuscript Division of the Library of Congress.</p>
        <p className="mt-2">Each image contain a line or two of writings. You need to type the exact text shown in the image. Some are incomplete sentences.</p>
        <p className="mt-2">Next, you will see an example.</p>
        <button className="mt-8 px-6 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setIndex(-1)}>Continue</button>
      </div>
    )
  }

  if (index === -1) {
    return (
      <div className="max-w-2xl w-full px-6 py-12">
        <p className="text-center font-semibold mb-4"><strong>Example</strong></p>
        <div className="relative w-full h-24 mb-4">
          <Image src="/transcription/example.jpg" alt="example" fill className="object-contain" />
        </div>
        <textarea
          disabled
          cols={80}
          rows={2}
          value="The several subjects, to which I have now referred, open a wide range to your"
          className="w-full border border-gray-300 rounded p-2 bg-gray-50 text-gray-500 resize-none"
        />
        <div className="text-center mt-6">
          <button className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setIndex(0)}>Start</button>
        </div>
      </div>
    )
  }

  if (index >= images.length) {
    return (
      <div className="max-w-xl text-center px-6 py-12">
        <p><strong>Complete</strong></p>
        <p className="mt-4">You transcribed {count} image{count !== 1 ? 's' : ''}.</p>
        <Link href="/" className="mt-8 inline-block px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">Back to tests</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl w-full px-6 py-8">
      <ProgressBar value={index / images.length} />
      <div className="relative w-full h-28 mb-6">
        <Image src={`/transcription/${images[index]}.jpg`} alt="manuscript" fill className="object-contain" />
      </div>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        cols={80}
        rows={2}
        autoFocus
        className="w-full border border-gray-300 rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <div className="mt-4">
        <button className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={submit}>Next</button>
      </div>
    </div>
  )
}
