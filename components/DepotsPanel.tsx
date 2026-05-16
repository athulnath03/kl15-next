"use client";

import { useState } from "react";
import { Search, Building2 } from "lucide-react";
import DepotCard from "@/components/DepotCard";
import { depots } from "@/data/depots";

export default function DepotsPanel() {
  const [search, setSearch] = useState("");

  const filteredDepots = depots.filter((depot) =>
    depot.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="min-h-screen bg-neutral-50 px-5 pt-10 pb-28 space-y-7">

      {/* HEADER */}
      <div>
        <h1 className="text-[36px] leading-[1.05] font-black text-neutral-900 tracking-tight">
          Depots
        </h1>
        <p className="mt-2 text-[15px] text-neutral-400 font-medium">
          Search KSRTC depots &amp; contacts
        </p>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-3 rounded-2xl bg-white border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-4 py-3.5">
        <Search size={16} className="text-neutral-400 shrink-0" />
        <input
          type="text"
          placeholder="Search depot..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-[15px] font-medium text-neutral-800 outline-none placeholder:text-neutral-300"
        />
      </div>

      {/* RESULTS */}
      <div className="space-y-3">
        {filteredDepots.length > 0 ? (
          filteredDepots.map((depot) => (
            <DepotCard key={depot.name} name={depot.name} phone={depot.phone} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 size={32} className="text-neutral-200 mb-3" />
            <p className="text-[15px] font-semibold text-neutral-400">No depots found</p>
            <p className="text-[13px] text-neutral-300 mt-1">Try a different search term</p>
          </div>
        )}
      </div>

    </section>
  );
}
