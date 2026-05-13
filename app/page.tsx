"use client";

import { useState } from "react";
import HomePanel from "@/components/HomePanel";
import BottomNav from "@/components/BottomNav";
import DepotsPanel from "@/components/DepotsPanel";
import TimingsPanel from "@/components/TimingsPanel";
import MapPanel from "@/components/MapPanel";
import PageTransition from "@/components/PageTransition";

export default function HomePage() {
  const [activeTab, setActiveTab] =
    useState<"home" | "depots" | "map" | "timings">("home");

  return (
    <main className="min-h-screen bg-[#f5f4f0] pb-32">

      <PageTransition pageKey={activeTab}>

        {activeTab === "home" && (
          <HomePanel onSwitchTab={setActiveTab} />
        )}

        {activeTab === "depots" && <DepotsPanel />}

        {activeTab === "map" && <MapPanel />}

        {activeTab === "timings" && <TimingsPanel />}

      </PageTransition>

      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

    </main>
  );
}
