"use client";

import dynamic from "next/dynamic";

const DepotMap = dynamic(
  () => import("@/components/DepotMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-neutral-200 border-t-red-600 rounded-full animate-spin" />
          <p className="text-[13px] text-neutral-400 font-medium">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export default function MapPanel() {
return (
  <section className="min-h-screen pb-5">
    <div className="px-5 pt-10 space-y-7">
      <div>
        <h1 className="text-[36px] leading-[1.05] font-black text-neutral-900">
          Find Depots
        </h1>

        <p className="mt-2 text-[15px] text-neutral-400 font-medium">
          Locate nearby depots or search cities
        </p>
      </div>

      <DepotMap />
    </div>
  </section>
);
}
