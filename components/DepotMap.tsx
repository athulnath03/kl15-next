"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { depots } from "@/data/depots";
import { Search, Phone, Map } from "lucide-react";

type Depot = {
  name: string;
  pin: string;
  phone: string;
  lat: number;
  lng: number;
};

type DepotWithDistance = Depot & {
  distance: number;
};

if (typeof window !== "undefined") {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "",
    shadowUrl: "",
    iconRetinaUrl: "",
  });
}

function makeBusIcon(selected = false) {
  const size = selected ? 40 : 34;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:#dc2626;border:2px solid #fff;
      display:flex;align-items:center;justify-content:center;
      font-size:${selected ? 19 : 16}px;
      box-shadow:${
        selected
          ? "0 0 0 4px rgba(220,38,38,0.18),0 4px 12px rgba(0,0,0,0.22)"
          : "0 2px 8px rgba(0,0,0,0.18)"
      };
    ">🚌</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#3b82f6;border:3px solid #fff;
    box-shadow:0 0 0 5px rgba(59,130,246,0.2),0 2px 6px rgba(0,0,0,0.18);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
});

function calcDist(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sortDepots(origin: [number, number]): DepotWithDistance[] {
  return depots
    .map((d) => ({
      ...d,
      distance: calcDist(origin[0], origin[1], d.lat, d.lng),
    }))
    .sort((a, b) => a.distance - b.distance);
}

async function geocodeCity(q: string): Promise<[number, number] | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=in&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await r.json();
    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    }
  } catch {}
  return null;
}

// ── Detect desktop ───────────────────────────────────────
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

// ── Routing ──────────────────────────────────────────────
function Routing({
  userPos,
  depot,
}: {
  userPos: [number, number];
  depot: DepotWithDistance;
}) {
  const map = useMap();
  const ref = useRef<any>(null);

  useEffect(() => {
    if (!map) return;
    if (ref.current) {
      try {
        ref.current.getPlan()?.setWaypoints([]);
        ref.current.remove();
      } catch {}
      ref.current = null;
    }
    try {
      const ctrl = (L as any).Routing.control({
        waypoints: [
          L.latLng(userPos[0], userPos[1]),
          L.latLng(depot.lat, depot.lng),
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: false,
        show: false,
        createMarker: () => null,
        lineOptions: {
          styles: [
            { color: "#dc2626", weight: 4, opacity: 0.75, dashArray: "8 6" },
          ],
          extendToWaypoints: false,
          missingRouteTolerance: 0,
        },
      });
      ctrl.addTo(map);
      ref.current = ctrl;
    } catch {}
    return () => {
      try {
        if (ref.current) {
          ref.current.getPlan()?.setWaypoints([]);
          ref.current.remove();
        }
      } catch {}
      ref.current = null;
    };
  }, [map, userPos, depot]);

  return null;
}

// ── Map controller ───────────────────────────────────────
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  const prev = useRef<string>("");
  const mounted = useRef(false);

  useEffect(() => {
    if (!Number.isFinite(center[0]) || !Number.isFinite(center[1])) return;
    const key = `${center[0]},${center[1]}`;
    if (!mounted.current) {
      mounted.current = true;
      prev.current = key;
      return;
    }
    if (key !== prev.current) {
      prev.current = key;
      try {
        map.flyTo(center, zoom, { duration: 1.1, easeLinearity: 0.3 });
      } catch {}
    }
  }, [center, zoom, map]);

  return null;
}

// ── Map panel ────────────────────────────────────────────
function DepotMapView({
  mapCenter,
  userPos,
  displayedDepots,
  selectedDepot,
  handleSelect,
  refreshLocation,
}: {
  mapCenter: [number, number];
  userPos: [number, number] | null;
  displayedDepots: DepotWithDistance[];
  selectedDepot: DepotWithDistance | null;
  handleSelect: (d: DepotWithDistance) => void;
  refreshLocation: () => void;
}) {
  const FALLBACK: [number, number] = [10.8505, 76.2711];

  const safeCenter: [number, number] =
    Number.isFinite(mapCenter[0]) && Number.isFinite(mapCenter[1])
      ? mapCenter
      : FALLBACK;

  const safeUserPos =
    userPos &&
    Number.isFinite(userPos[0]) &&
    Number.isFinite(userPos[1])
      ? userPos
      : null;

  // Refresh button below zoom controls
  useEffect(() => {
    const map = (window as any).__leaflet_map__;

    if (!map) return;

    const RefreshControl = L.Control.extend({
      options: {
        position: "topleft",
      },

      onAdd: function () {
        const btn = L.DomUtil.create("button", "");

        btn.innerHTML = "↻";

        btn.style.width = "34px";
        btn.style.height = "34px";
        btn.style.background = "#fff";
        btn.style.border = "1px solid #e5e5e5";
        btn.style.borderRadius = "8px";
        btn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "18px";
        btn.style.fontWeight = "bold";
        btn.style.marginTop = "10px";

        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          refreshLocation();
        };

        return btn;
      },
    });

    const control = new RefreshControl();

    map.addControl(control);

    return () => {
      map.removeControl(control);
    };
  }, [refreshLocation]);

  return (
    <MapContainer
      center={safeCenter}
      zoom={11}
      scrollWheelZoom
      whenReady={(e) => {
        (window as any).__leaflet_map__ = e.target;
      }}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController center={safeCenter} zoom={11} />

      {safeUserPos && (
        <Marker position={safeUserPos} icon={userIcon}>
          <Popup closeButton={false}>
            <div className="font-semibold text-[13px] py-0.5">
              📍 You are here
            </div>
          </Popup>
        </Marker>
      )}

      {displayedDepots.map((depot) => (
        <Marker
          key={depot.name}
          position={[depot.lat, depot.lng]}
          icon={makeBusIcon(selectedDepot?.name === depot.name)}
          eventHandlers={{
            click: () => handleSelect(depot),
          }}
        >
          <Popup closeButton={false}>
            <div className="min-w-[120px] py-0.5">
              <p className="font-bold text-[13px]">
                {depot.name}
              </p>

              <p className="text-[11px] text-red-600 font-semibold">
                {depot.distance.toFixed(1)} km away
              </p>

              <p className="text-[11px] text-neutral-400">
                {depot.phone}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {safeUserPos && selectedDepot && (
        <Routing
          userPos={safeUserPos}
          depot={selectedDepot}
        />
      )}
    </MapContainer>
  );
}


// ── Depot list ───────────────────────────────────────────
function DepotList({
  depots,
  selectedDepot,
  handleSelect,
}: {
  depots: DepotWithDistance[];
  selectedDepot: DepotWithDistance | null;
  handleSelect: (d: DepotWithDistance) => void;
}) {
  return (
    <div className="space-y-2.5">
      {depots.map((depot, i) => {
        const isSelected = selectedDepot?.name === depot.name;
        const gmapUrl = `https://www.google.com/maps/dir/?api=1&destination=${depot.lat},${depot.lng}&travelmode=driving`;
        return (
          <button
            key={depot.name}
            onClick={() => handleSelect(depot)}
            className={`w-full bg-white rounded-2xl text-left overflow-hidden transition-all duration-150 active:scale-[0.99] ${
              isSelected
                ? "border border-red-100 shadow-[0_4px_20px_rgba(220,38,38,0.1)]"
                : "border border-transparent shadow-sm"
            }`}
          >
            <div className="flex items-stretch">
              <div
                className={`w-[4px] rounded-l-2xl shrink-0 ${
                  isSelected ? "bg-red-600" : "bg-red-400"
                }`}
              />
              <div className="flex items-center px-2.5 py-3 shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i === 0 ? "bg-red-600" : "bg-red-100"
                  }`}
                >
                  <span
                    className={`font-black text-[13px] ${
                      i === 0 ? "text-white" : "text-red-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                </div>
              </div>
              <div className="flex-1 py-3 min-w-0">
                <p className="text-[15px] font-bold text-neutral-900 truncate">
                  {depot.name}
                </p>
                <p className="text-[12px] font-bold text-red-600 mt-0.5">
                  {depot.distance.toFixed(1)} km away
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                  {depot.phone}
                </p>
              </div>
              <div className="flex flex-col gap-2 justify-center pr-3 py-3 shrink-0">
                <a
                  href={`tel:${depot.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-sm"
                >
                  <Phone size={15} className="text-white" />
                </a>
                <a
                  href={gmapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-10 h-10 rounded-2xl border-2 border-red-600 bg-white flex items-center justify-center"
                >
                  <Map size={15} className="text-red-600" />
                </a>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}


// ── Search bar ───────────────────────────────────────────
function SearchBar({
  search,
  setSearch,
  isGeocoding,
  handleSearch,
  resetToMyLocation,
}: {
  search: string;
  setSearch: (v: string) => void;
  isGeocoding: boolean;
  handleSearch: () => void;
  resetToMyLocation: () => void;
}) {
  return (
    <div className="flex gap-2">
      <div className="flex-1 flex items-center bg-white rounded-2xl px-3 border border-neutral-100 shadow-sm">
        <input
          type="text"
          placeholder="Search city or place..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 py-3 text-[14px] bg-transparent outline-none placeholder:text-neutral-300"
        />
        {search.length > 0 && (
          <button
            onClick={() => {
              setSearch("");
              resetToMyLocation();
            }}
            className="text-neutral-300 text-lg ml-1"
          >
            ×
          </button>
        )}
      </div>
      <button
        onClick={handleSearch}
        disabled={isGeocoding || !search.trim()}
        className="w-11 h-11 rounded-2xl bg-red-600 flex items-center justify-center disabled:opacity-40 hover:bg-red-700 active:scale-95 transition-all"
      >
        {isGeocoding ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Search size={16} className="text-white" />
        )}
      </button>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────
export default function DepotMap() {
  const FALLBACK: [number, number] = [10.8505, 76.2711];

  // null = not yet detected, true = desktop, false = mobile
  const isDesktop = useIsDesktop();

  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [sortedDepots, setSortedDepots] = useState<DepotWithDistance[]>([]);
  const [selectedDepot, setSelectedDepot] =
    useState<DepotWithDistance | null>(null);
  const [search, setSearch] = useState("");
  const [searchLabel, setSearchLabel] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(FALLBACK);

const fetchLocation = (force = false) => {
  if (!force) {
    const cached = sessionStorage.getItem("user-location");

    if (cached) {
      try {
        const parsed = JSON.parse(cached);

        if (
          Array.isArray(parsed) &&
          Number.isFinite(parsed[0]) &&
          Number.isFinite(parsed[1])
        ) {
          setUserPos(parsed);
          setMapCenter(parsed);

          const sorted = sortDepots(parsed);
          setSortedDepots(sorted);
          setSelectedDepot(sorted[0]);

          return;
        }
      } catch {}
    }
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const pos: [number, number] = [
        coords.latitude,
        coords.longitude,
      ];

      sessionStorage.setItem(
        "user-location",
        JSON.stringify(pos)
      );

      setUserPos(pos);
      setMapCenter(pos);

      const sorted = sortDepots(pos);
      setSortedDepots(sorted);
      setSelectedDepot(sorted[0]);
    },
    () => {
      setUserPos(FALLBACK);
      setMapCenter(FALLBACK);

      const sorted = sortDepots(FALLBACK);
      setSortedDepots(sorted);
      setSelectedDepot(sorted[0]);
    }
  );
};

useEffect(() => {
  fetchLocation();
}, []);

  const displayedDepots = useMemo(
    () => sortedDepots.slice(0, 10),
    [sortedDepots]
  );

  const handleSearch = async () => {
    const q = search.trim();
    if (!q) return;
    setIsGeocoding(true);
    const coords = await geocodeCity(q);
    setIsGeocoding(false);
    if (!coords) return;
    const sorted = sortDepots(coords);
    setSortedDepots(sorted);
    setSelectedDepot(sorted[0]);
    setMapCenter(coords);
    setSearchLabel(q);
  };

  const handleSelect = (depot: DepotWithDistance) => {
    setSelectedDepot(depot);
    setMapCenter([depot.lat, depot.lng]);
  };

  const resetToMyLocation = () => {
    if (!userPos) return;
    const sorted = sortDepots(userPos);
    setSortedDepots(sorted);
    setSelectedDepot(sorted[0]);
    setMapCenter(userPos);
    setSearch("");
    setSearchLabel(null);
  };

  const sharedMapProps = {
    mapCenter,
    userPos,
    displayedDepots,
    selectedDepot,
    handleSelect,
    refreshLocation: () => fetchLocation(true),
  };

  const searchBarProps = {
    search,
    setSearch,
    isGeocoding,
    handleSearch,
    resetToMyLocation,
  };

  const resultLabel = (
    <div className="flex items-center justify-between">
      <p className="text-[12px] text-neutral-500">
        <span className="font-bold text-neutral-900">
          {displayedDepots.length} nearest depots
        </span>{" "}
        to{" "}
        <span className="font-bold text-neutral-700">
          {searchLabel ?? "your location"}
        </span>
      </p>
      {searchLabel && (
        <button
          onClick={resetToMyLocation}
          className="text-[12px] font-semibold text-red-600 hover:text-red-700"
        >
          Use my location
        </button>
      )}
    </div>
  );

  // Don't render anything until we know screen size —
  // prevents both maps mounting simultaneously
  if (isDesktop === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <span className="w-8 h-8 border-2 border-neutral-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  // ── DESKTOP ───────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="flex h-screen overflow-hidden bg-neutral-50">
        {/* Left — full-height map */}
        <div className="w-1/2 xl:w-3/5 flex-shrink-0">
          <DepotMapView {...sharedMapProps} />
        </div>

        {/* Right — scrollable panel */}
        <div className="w-1/2 xl:w-2/5 flex flex-col overflow-hidden bg-neutral-50">
          <div className="px-5 pt-5 pb-3 bg-neutral-50 border-b border-neutral-100 space-y-3 flex-shrink-0">
            <SearchBar {...searchBarProps} />
            {resultLabel}
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-3">
            <DepotList
              depots={displayedDepots}
              selectedDepot={selectedDepot}
              handleSelect={handleSelect}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── MOBILE ────────────────────────────────────────────
  return (
    <div className="pb-2">
      <div
        className="mt-3 rounded-3xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
        style={{ height: "34vh", maxHeight: 290 }}
      >
        <DepotMapView {...sharedMapProps} />
      </div>

      <div className="pt-3 space-y-2.5">
        <SearchBar {...searchBarProps} />
        {resultLabel}
        <DepotList
          depots={displayedDepots}
          selectedDepot={selectedDepot}
          handleSelect={handleSelect}
        />
      </div>
    </div>
  );
}
