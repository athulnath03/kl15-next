"use client";

import {
  Home,
  Building2,
  Map,
  Clock3,
} from "lucide-react";

type TabType =
  | "home"
  | "depots"
  | "map"
  | "timings";

type Props = {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
};

export default function BottomNav({
  activeTab,
  onChangeTab,
}: Props) {
  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[92%] -translate-x-1/2 rounded-3xl bg-white p-2 shadow-xl">

      <div className="grid grid-cols-4 gap-2">

        <button
          onClick={() => onChangeTab("home")}
          className={`flex flex-col items-center rounded-2xl py-3 ${
            activeTab === "home"
              ? "bg-red-50 text-red-600"
              : "text-gray-500"
          }`}
        >
          <Home size={24} />
          <span className="mt-1 text-xs font-semibold">
            Home
          </span>
        </button>

        <button
          onClick={() => onChangeTab("depots")}
          className={`flex flex-col items-center rounded-2xl py-3 ${
            activeTab === "depots"
              ? "bg-red-50 text-red-600"
              : "text-gray-500"
          }`}
        >
          <Building2 size={24} />
          <span className="mt-1 text-xs font-semibold">
            Depots
          </span>
        </button>

        <button
          onClick={() => onChangeTab("map")}
          className={`flex flex-col items-center rounded-2xl py-3 ${
            activeTab === "map"
              ? "bg-red-50 text-red-600"
              : "text-gray-500"
          }`}
        >
          <Map size={24} />
          <span className="mt-1 text-xs font-semibold">
            Map
          </span>
        </button>

        <button
          onClick={() => onChangeTab("timings")}
          className={`flex flex-col items-center rounded-2xl py-3 ${
            activeTab === "timings"
              ? "bg-red-50 text-red-600"
              : "text-gray-500"
          }`}
        >
          <Clock3 size={24} />
          <span className="mt-1 text-xs font-semibold">
            Timings
          </span>
        </button>

      </div>

    </nav>
  );
}
