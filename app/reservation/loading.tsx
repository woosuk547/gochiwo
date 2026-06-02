export default function Loading() {
  return (
    <main className="min-h-screen bg-white px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="h-8 w-40 animate-pulse bg-gray-100" />
        <div className="mt-4 h-4 w-64 animate-pulse bg-gray-100" />
        <div className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:gap-8">
          <div className="space-y-5">
            <div className="aspect-[16/9] w-full animate-pulse bg-gray-100" />
            <div className="h-80 w-full animate-pulse bg-gray-100" />
          </div>
          <div className="h-[28rem] w-full animate-pulse bg-gray-100" />
        </div>
      </div>
    </main>
  )
}
