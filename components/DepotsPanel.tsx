"use client";

import { useState } from "react";

import { Search } from "lucide-react";

import DepotCard from "@/components/DepotCard";
import { depots } from "@/data/depots";

export default function DepotsPanel() {
  const [search, setSearch] = useState("");

  const filteredDepots = depots.filter((depot) =>
    depot.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="space-y-4 p-4">

      <div>

        <h2 className="text-3xl font-black">
          Depots
        </h2>

        <p className="mt-1 text-gray-500">
          Search KSRTC depots
        </p>

      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm">

        <Search className="text-gray-400" />

        <input
          type="text"
          placeholder="Search depot..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent outline-none"
        />

      </div>

      <div className="space-y-4">

        {filteredDepots.map((depot) => (
          <DepotCard
            key={depot.name}
            name={depot.name}
            phone={depot.phone}
          />
        ))}

      </div>

    </section>
  );
}
