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

// ── Bus icon ─────────────────────────────────────────────
function makeBusIcon(selected = false) {
  const size = selected ? 40 : 34;

  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:#dc2626;
      border:2px solid #fff;
      display:flex;
      align-items:center;
      justify-content:center;
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

// ── User icon ────────────────────────────────────────────
const userIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:18px;
    height:18px;
    border-radius:50%;
    background:#3b82f6;
    border:3px solid #fff;
    box-shadow:0 0 0 5px rgba(59,130,246,0.2),0 2px 6px rgba(0,0,0,0.18);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
});

// ── Distance ─────────────────────────────────────────────
function calcDist(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
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

// ── Geocode ──────────────────────────────────────────────
async function geocodeCity(
  q: string
): Promise<[number, number] | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        q
      )}&countrycodes=in&format=json&limit=1`,
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );

    const data = await r.json();

    if (data.length > 0) {
      return [
        parseFloat(data[0].lat),
        parseFloat(data[0].lon),
      ];
    }
  } catch {}

  return null;
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
          {
            color: "#dc2626",
            weight: 4,
            opacity: 0.75,
            dashArray: "8 6",
          },
        ],
        extendToWaypoints: false,
        missingRouteTolerance: 0,
      },
    });

    ctrl.addTo(map);
    ref.current = ctrl;

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

// ── Fly to ───────────────────────────────────────────────
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  const prev = useRef("");

  useEffect(() => {
    const key = center.join(",");

    if (key !== prev.current) {
      prev.current = key;

      map.flyTo(center, zoom, {
        duration: 1.1,
        easeLinearity: 0.3,
      });
    }
  }, [center, zoom, map]);

  return null;
}

// ─────────────────────────────────────────────────────────
export default function DepotMap() {
  const [userPos, setUserPos] =
    useState<[number, number] | null>(null);

  const [sortedDepots, setSortedDepots] = useState<
    DepotWithDistance[]
  >([]);

  const [selectedDepot, setSelectedDepot] =
    useState<DepotWithDistance | null>(null);

  const [search, setSearch] = useState("");
  const [searchLabel, setSearchLabel] =
    useState<string | null>(null);

  const [isGeocoding, setIsGeocoding] = useState(false);

  const [mapCenter, setMapCenter] =
    useState<[number, number]>([10.8505, 76.2711]);

  // ── Get user location ─────────────────────────────────
  useEffect(() => {
    const fallback: [number, number] = [10.8505, 76.2711];

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos: [number, number] = [
          coords.latitude,
          coords.longitude,
        ];

        setUserPos(pos);
        setMapCenter(pos);

        const sorted = sortDepots(pos);

        setSortedDepots(sorted);
        setSelectedDepot(sorted[0]);
      },
      () => {
        setUserPos(fallback);
        setMapCenter(fallback);

        const sorted = sortDepots(fallback);

        setSortedDepots(sorted);
        setSelectedDepot(sorted[0]);
      }
    );
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

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">

      {/* ── MAP ───────────────────────────────────── */}
      <div
        className=" mt-3 rounded-3xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
        style={{
          height: "34vh",
          maxHeight: 290,
        }}
      >
        <MapContainer
          center={mapCenter}
          zoom={11}
          scrollWheelZoom
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController center={mapCenter} zoom={11} />

          {/* User */}
          {userPos && (
            <Marker position={userPos} icon={userIcon}>
              <Popup closeButton={false}>
                <div className="font-semibold text-[13px] py-0.5">
                  📍 You are here
                </div>
              </Popup>
            </Marker>
          )}

          {/* Depots */}
          {displayedDepots.map((depot) => (
            <Marker
              key={depot.name}
              position={[depot.lat, depot.lng]}
              icon={makeBusIcon(
                selectedDepot?.name === depot.name
              )}
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

          {/* Route */}
          {userPos && selectedDepot && (
            <Routing
              userPos={userPos}
              depot={selectedDepot}
            />
          )}
        </MapContainer>
      </div>

      {/* ── CONTENT ───────────────────────────────── */}
      <div className=" pt-3 space-y-2.5">

        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-white rounded-2xl px-3 border border-neutral-100 shadow-sm">
            <input
              type="text"
              placeholder="Search city or place..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleSearch()
              }
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
            className="w-11 h-11 rounded-2xl bg-red-600 flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
          >
            {isGeocoding ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search size={16} className="text-white" />
            )}
          </button>
        </div>

        {/* Result label */}
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
              className="text-[12px] font-semibold text-red-600"
            >
              Use my location
            </button>
          )}
        </div>

        {/* Depot cards */}
        <div className="space-y-2.5">
          {displayedDepots.map((depot, i) => {
            const isSelected =
              selectedDepot?.name === depot.name;

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

                  {/* Accent */}
                  <div
                    className={`w-[4px] rounded-l-2xl shrink-0 ${
                      isSelected
                        ? "bg-red-600"
                        : "bg-red-400"
                    }`}
                  />

                  {/* Rank */}
                  <div className="flex items-center px-2.5 py-3 shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        i === 0
                          ? "bg-red-600"
                          : "bg-red-100"
                      }`}
                    >
                      <span
                        className={`font-black text-[13px] ${
                          i === 0
                            ? "text-white"
                            : "text-red-600"
                        }`}
                      >
                        {i + 1}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
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

                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-center pr-3 py-3 shrink-0">

                    {/* Call filled */}
                    <a
                      href={`tel:${depot.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-sm"
                    >
                      <Phone
                        size={15}
                        className="text-white"
                      />
                    </a>

                    {/* Map outlined */}
                    <a
                      href={gmapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 rounded-2xl border-2 border-red-600 bg-white flex items-center justify-center"
                    >
                      <Map
                        size={15}
                        className="text-red-600"
                      />
                    </a>
                  </div>

                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
