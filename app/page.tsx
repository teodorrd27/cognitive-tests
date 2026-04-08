import Link from 'next/link'

const tests = [
  { id: 'stroop', label: 'Stroop Test' },
  { id: 'flanker', label: 'Flanker Test' },
  { id: 'n-back', label: 'N-Back Test' },
  { id: 'task-switching', label: 'Task Switching Test' },
  { id: 'pointing', label: 'Self-Ordered Pointing Test' },
]

export default function Home() {
  return (
    <div className="text-center max-w-xl w-full px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Cognitive Tests</h1>
      <p className="text-gray-500 mb-10">Select a test to begin.</p>
      <div className="flex flex-col gap-3">
        {tests.map((t) => (
          <Link
            key={t.id}
            href={`/${t.id}`}
            className="block w-full py-3 px-6 rounded border border-gray-300 hover:bg-gray-100 transition-colors text-lg font-medium"
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
