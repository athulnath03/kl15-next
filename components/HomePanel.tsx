"use client";

type Props = {
  onSwitchTab: (
    tab: "home" | "depots" | "map" | "timings"
  ) => void;
};

export default function HomePanel({ onSwitchTab }: Props) {
  return (
    <section className="p-4 space-y-5">

      {/* HEADER */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-red-600 to-red-700 p-6 text-white shadow-lg">

        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10">

          <div className="flex items-center gap-3">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-lg">
              🚌
            </div>

            <div>
              <h1 className="text-5xl font-black tracking-tight">
                KL15
              </h1>

              <p className="text-sm text-red-100">
                Routes. Depots. Timings.
              </p>
            </div>

          </div>

          <div className="mt-10 border-t border-white/20 pt-6">

            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-100">
              KSRTC Kerala
            </p>

            <h2 className="mt-3 text-4xl font-black leading-tight">
              Where to today?
            </h2>

            <p className="mt-3 text-base text-red-100">
              Palakkad District · KL15 Transit
            </p>

          </div>

        </div>

      </div>

      {/* ACTION TILES */}
      <div className="grid grid-cols-2 gap-4">

        {/* DEPOTS */}
        <button
          onClick={() => onSwitchTab("depots")}
          className="rounded-[28px] bg-white p-5 text-left shadow-sm transition active:scale-95"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-3xl">
            🏢
          </div>

          <h2 className="text-lg font-black">Depots</h2>
          <p className="mt-1 text-sm text-gray-500">
            Browse all KSRTC depots
          </p>
        </button>

        {/* FIND NEARBY */}
        <button
          onClick={() => onSwitchTab("map")}
          className="rounded-[28px] bg-white p-5 text-left shadow-sm transition active:scale-95"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-3xl">
            📍
          </div>

          <h2 className="text-lg font-black">Find Nearby</h2>
          <p className="mt-1 text-sm text-gray-500">
            Locate nearest depots
          </p>
        </button>

      </div>

      {/* HELPLINES */}
      <div className="rounded-[28px] bg-white p-5 shadow-sm">

        <div className="mb-4">
          <h2 className="text-xl font-black">KSRTC Helplines</h2>
          <p className="text-sm text-gray-500">
            Official KSRTC support numbers
          </p>
        </div>

        <div className="space-y-3">

          <a
            href="tel:9513948001"
            className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 transition active:scale-[0.98]"
          >
            <div>
              <p className="text-sm text-gray-500">KSRTC Swift Support</p>
              <h3 className="text-lg font-bold">9513948001</h3>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-2xl">
              📞
            </div>
          </a>

          <a
            href="tel:04712423290"
            className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 transition active:scale-[0.98]"
          >
            <div>
              <p className="text-sm text-gray-500">KSRTC Customer Care</p>
              <h3 className="text-lg font-bold">0471 2423290</h3>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl">
              ☎️
            </div>
          </a>

        </div>

      </div>

    </section>
  );
}
