import Link from 'next/link'

const COGNITIVE_TESTS = [
  { id: 'stroop',          label: 'Stroop Test' },
  { id: 'flanker',         label: 'Flanker Test' },
  { id: 'n-back',          label: 'N-Back Test' },
  { id: 'task-switching',  label: 'Task Switching Test' },
  { id: 'pointing',        label: 'Self-Ordered Pointing Test' },
]

const CROWD_TASKS = [
  { id: 'classification', label: 'Classification' },
  { id: 'counting',       label: 'Counting' },
  { id: 'sentiment',      label: 'Sentiment Analysis' },
  { id: 'transcription',  label: 'Transcription' },
  { id: 'proofreading',   label: 'Proofreading' },
]

function Category({ title, items }: { title: string; items: { id: string; label: string }[] }) {
  return (
    <div className="w-full">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">{title}</h2>
      <div className="flex flex-col gap-2">
        {items.map(t => (
          <Link
            key={t.id}
            href={`/${t.id}`}
            className="block w-full py-3 px-5 rounded border border-gray-200 hover:bg-gray-50 hover:border-gray-400 transition-colors text-base font-medium"
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="max-w-lg w-full px-6 py-16">
      <h1 className="text-3xl font-bold mb-1">CrowdCog Tests</h1>
      <p className="text-gray-400 mb-10 text-sm">Select a test to begin.</p>
      <div className="flex flex-col gap-10">
        <Category title="Cognitive Tests" items={COGNITIVE_TESTS} />
        <Category title="Crowd Tasks" items={CROWD_TASKS} />
      </div>
    </div>
  )
}
