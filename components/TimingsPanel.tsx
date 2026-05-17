"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpDown, MapPin } from "lucide-react";
import { TOWNS, KSRTC_CITY } from "@/data/ksrtc";

function resolveKsrtcCity(name: string) {
  if (!name) return null;
  if (KSRTC_CITY[name]) return KSRTC_CITY[name];
  const key = Object.keys(KSRTC_CITY).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  );
  if (key) return KSRTC_CITY[key];
  const partial = Object.keys(KSRTC_CITY).find(
    (k) =>
      k.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(k.toLowerCase())
  );
  if (partial) return KSRTC_CITY[partial];
  return name;
}

function buildUrl(from: string, to: string, date: string) {
  const d = date || new Date().toISOString().slice(0, 10);
  const [y, mo, dd] = d.split("-");
  const fmt = `${dd}-${mo}-${y}`;
  return `https://www.onlineksrtcswift.com/search?mode=oneway&fromCity=${encodeURIComponent(from)}&toCity=${encodeURIComponent(to)}&departDate=${encodeURIComponent(fmt)}`;
}

export default function TimingsPanel() {
  const towns = useMemo(() => Object.keys(TOWNS), []);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [active, setActive] = useState<"from" | "to" | null>(null);

  const today = new Date();
  const dates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return {
      value: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      isToday: i === 0,
    };
  });

  const [selectedDate, setSelectedDate] = useState(dates[0].value);

  const fromSuggestions = useMemo(() => {
    if (!from) return towns.slice(0, 5);
    return towns.filter((t) => t.toLowerCase().includes(from.toLowerCase())).slice(0, 5);
  }, [from, towns]);

  const toSuggestions = useMemo(() => {
    if (!to) return towns.slice(0, 5);
    return towns.filter((t) => t.toLowerCase().includes(to.toLowerCase())).slice(0, 5);
  }, [to, towns]);

  const swapPlaces = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = () => {
    const fromToken = resolveKsrtcCity(from);
    const toToken = resolveKsrtcCity(to);
    if (!fromToken || !toToken) return;
    window.open(buildUrl(fromToken, toToken, selectedDate), "_blank");
  };

  const canSearch = from.trim() && to.trim();

  return (
    <div className="min-h-screen px-5 pt-10 pb-28">

      {/* HEADER */}
      <div className="mb-7">
        <h1 className="text-[36px] leading-[1.05] font-black text-neutral-900 tracking-tight">
          Bus Timings
        </h1>
        <p className="mt-2 text-[15px] text-neutral-400 font-medium">
          Search live schedules &amp; book tickets
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="rounded-3xl bg-white shadow-[0_2px_24px_rgba(0,0,0,0.08)] overflow-visible">

        {/* Route section */}
        <div className="p-5">

          {/* FROM field */}
          <div className="relative">
            <label className="flex items-center gap-1.5 mb-2">
              <MapPin size={11} className="text-neutral-400" />
              <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">From</span>
            </label>

            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onFocus={() => setActive("from")}
              placeholder="Departure city"
              className="w-full rounded-2xl bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-[15px] font-medium text-neutral-800 outline-none placeholder:text-neutral-300 focus:border-red-200 focus:bg-red-50/30 transition-colors"
            />

            {active === "from" && fromSuggestions.length > 0 && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-neutral-100">
                {fromSuggestions.map((t, i) => (
                  <div
                    key={t}
                    onClick={() => { setFrom(t); setActive(null); }}
                    className={`cursor-pointer px-4 py-3.5 text-[14px] font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-3 ${i > 0 ? "border-t border-neutral-50" : ""}`}
                  >
                    <MapPin size={13} className="text-neutral-300 shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SWAP */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-neutral-100" />
            <button
              onClick={swapPlaces}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm active:scale-95 transition-transform"
            >
              <ArrowUpDown size={15} className="text-neutral-500" />
            </button>
            <div className="flex-1 h-px bg-neutral-100" />
          </div>

          {/* TO field */}
          <div className="relative">
            <label className="flex items-center gap-1.5 mb-2">
              <MapPin size={11} className="text-red-400" />
              <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">To</span>
            </label>

            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onFocus={() => setActive("to")}
              placeholder="Destination city"
              className="w-full rounded-2xl bg-neutral-50 border border-neutral-100 px-4 py-3.5 text-[15px] font-medium text-neutral-800 outline-none placeholder:text-neutral-300 focus:border-red-200 focus:bg-red-50/30 transition-colors"
            />

            {active === "to" && toSuggestions.length > 0 && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-neutral-100">
                {toSuggestions.map((t, i) => (
                  <div
                    key={t}
                    onClick={() => { setTo(t); setActive(null); }}
                    className={`cursor-pointer px-4 py-3.5 text-[14px] font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-3 ${i > 0 ? "border-t border-neutral-50" : ""}`}
                  >
                    <MapPin size={13} className="text-red-300 shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-neutral-100" />

        {/* DATE section */}
        <div className="p-5">
          <p className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase mb-3">
            Journey Date
          </p>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {dates.map((d) => {
              const isSelected = selectedDate === d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => setSelectedDate(d.value)}
                  className={`relative min-w-[64px] flex-shrink-0 rounded-2xl px-2 py-3 text-center transition-all active:scale-95 ${
                    isSelected
                      ? "bg-red-600 text-white shadow-[0_4px_12px_rgba(185,28,28,0.35)]"
                      : "bg-neutral-50 text-neutral-600 border border-neutral-100"
                  }`}
                >
                  {d.isToday && !isSelected && (
                    <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-red-400" />
                  )}
                  <div className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? "text-red-200" : "text-neutral-400"}`}>
                    {d.day}
                  </div>
                  <div className="mt-1 text-[22px] leading-none font-black">
                    {d.date}
                  </div>
                  <div className={`mt-0.5 text-[10px] font-medium ${isSelected ? "text-red-200" : "text-neutral-400"}`}>
                    {d.month}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SEARCH BUTTON */}
        <div className="px-5 pb-5">
          <button
            onClick={handleSearch}
            disabled={!canSearch}
            className={`w-full h-[52px] rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              canSearch
                ? "bg-red-600 text-white shadow-[0_4px_16px_rgba(185,28,28,0.3)] hover:bg-red-700"
                : "bg-neutral-100 text-neutral-300 cursor-not-allowed"
            }`}
          >
            <Search size={16} />
            Search Live Timings
          </button>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <p className="mt-5 text-center text-[12px] text-neutral-300 font-medium">
        Opens on KSRTC Swift official site
      </p>
    </div>
  );
}
