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
    <section className="space-y-4 p-4">

      <div>
        <h2 className="text-3xl font-black">
          Kerala Depot Map
        </h2>

        <p className="text-gray-500">
          KSRTC depot locations
        </p>
      </div>

      <DepotMap />
    </section>
  );
}
