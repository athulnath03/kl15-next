"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
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

  return `https://www.onlineksrtcswift.com/search?mode=oneway&fromCity=${encodeURIComponent(
    from
  )}&toCity=${encodeURIComponent(
    to
  )}&departDate=${encodeURIComponent(fmt)}`;
}

export default function TimingsPanel() {
  const towns = useMemo(() => Object.keys(TOWNS), []);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [active, setActive] = useState<"from" | "to" | null>(
    null
  );

  const today = new Date();

  const dates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);

    return {
      value: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      date: d.getDate(),
      month: d.toLocaleDateString("en-US", {
        month: "short",
      }),
    };
  });

  const [selectedDate, setSelectedDate] = useState(
    dates[0].value
  );

  const fromSuggestions = useMemo(() => {
    if (!from) return towns.slice(0, 5);

    return towns
      .filter((t) =>
        t.toLowerCase().includes(from.toLowerCase())
      )
      .slice(0, 5);
  }, [from, towns]);

  const toSuggestions = useMemo(() => {
    if (!to) return towns.slice(0, 5);

    return towns
      .filter((t) =>
        t.toLowerCase().includes(to.toLowerCase())
      )
      .slice(0, 5);
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

    window.open(
      buildUrl(fromToken, toToken, selectedDate),
      "_blank"
    );
  };

  return (
    <div className="px-6 pt-8 pb-28">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-[42px] leading-none font-black text-black">
          Timings
        </h1>

        <p className="mt-3 text-lg text-neutral-500">
          Search KSRTC Swift timings
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="rounded-[32px] bg-white p-5 shadow-sm">

        {/* FROM */}
        <div className="relative">
          <p className="mb-3 text-sm font-bold tracking-wide text-neutral-600">
            FROM
          </p>

          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            onFocus={() => setActive("from")}
            placeholder="e.g. Thrissur, Kozhikode..."
            className="w-full rounded-[24px] bg-neutral-100 px-5 py-4 text-[15px] outline-none placeholder:text-neutral-400"
          />

          {active === "from" && (
            <div className="absolute z-20 mt-3 w-full overflow-hidden rounded-2xl bg-white shadow-xl">
              {fromSuggestions.map((t) => (
                <div
                  key={t}
                  onClick={() => {
                    setFrom(t);
                    setActive(null);
                  }}
                  className="cursor-pointer px-5 py-4 text-[15px] hover:bg-neutral-100"
                >
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SWAP */}
        <div className="flex justify-center py-5">
          <button
            onClick={swapPlaces}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100"
          >
            <ArrowUpDown
              size={18}
              className="text-neutral-700"
            />
          </button>
        </div>

        {/* TO */}
        <div className="relative">
          <p className="mb-3 text-sm font-bold tracking-wide text-neutral-600">
            TO
          </p>

          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            onFocus={() => setActive("to")}
            placeholder="e.g. Ernakulam, Trivandrum..."
            className="w-full rounded-[24px] bg-neutral-100 px-5 py-4 text-[15px] outline-none placeholder:text-neutral-400"
          />

          {active === "to" && (
            <div className="absolute z-20 mt-3 w-full overflow-hidden rounded-2xl bg-white shadow-xl">
              {toSuggestions.map((t) => (
                <div
                  key={t}
                  onClick={() => {
                    setTo(t);
                    setActive(null);
                  }}
                  className="cursor-pointer px-5 py-4 text-[15px] hover:bg-neutral-100"
                >
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DATE */}
        <div className="mt-7">
          <p className="mb-3 text-sm font-bold tracking-wide text-neutral-600">
            JOURNEY DATE
          </p>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {dates.map((d) => (
              <button
                key={d.value}
                onClick={() =>
                  setSelectedDate(d.value)
                }
                className={`min-w-[72px] rounded-2xl px-3 py-3 transition-all ${
                  selectedDate === d.value
                    ? "bg-red-700 text-white"
                    : "bg-neutral-100 text-neutral-700"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wide">
                  {d.day}
                </div>

                <div className="mt-1 text-[22px] leading-none font-black">
                  {d.date}
                </div>

                <div className="mt-1 text-[11px]">
                  {d.month}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH BUTTON */}
        <button
          onClick={handleSearch}
          className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-700 text-[16px] font-semibold text-white"
        >
          <Search size={18} />
          Search Live Timings
        </button>
      </div>
    </div>
  );
}
