interface HeaderProps {
  lastUpdated: string
}

export default function Header({ lastUpdated }: HeaderProps) {
  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(lastUpdated))

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              청약모아
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              SH · LH · GH 청약정보 한눈에
            </p>
          </div>
          <p className="text-xs text-gray-400">
            최근 업데이트: {formattedDate}
          </p>
        </div>
      </div>
    </header>
  )
}
