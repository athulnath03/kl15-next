"use client";

import dynamic from "next/dynamic";

const DepotMap = dynamic(
  () => import("@/components/DepotMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-3xl bg-gray-200">
        Loading Map...
      </div>
    ),
  }
);

export default function MapPanel() {
  return (
   <section className="min-h-screen bg-neutral-50 px-5 pt-10 pb-28 space-y-7">
      {/* HEADER */}
      <div>
        <h1 className="text-[36px] leading-[1.05] font-black text-neutral-900 tracking-tight">
          Find Depots
        </h1>
        <p className="mt-2 text-[15px] text-neutral-400 font-medium">
          Locate nearby depots or search cities
        </p>
      </div>

      <DepotMap />

    </section>
  );
}
