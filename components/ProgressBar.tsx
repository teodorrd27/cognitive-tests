'use client'

export default function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-4 bg-gray-200 rounded mb-8">
      <div
        className="h-4 bg-blue-500 rounded transition-all duration-200"
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  )
}
