export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#c0392b] text-white shadow-lg">
      <div className="px-5 py-4 text-center">

        <div className="flex items-center justify-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl">
            🚌
          </div>

          <h1 className="text-2xl font-extrabold">
            KL15
          </h1>

        </div>

        <p className="mt-1 text-sm opacity-80">
          Routes. Depots. Timings.
        </p>

      </div>
    </header>
  );
}
