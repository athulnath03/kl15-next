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

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import L from "leaflet";
import "leaflet-routing-machine";

import { depots } from "@/data/depots";

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

const icon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

function Routing({
  userPos,
  depot,
}: {
  userPos: [number, number];
  depot: DepotWithDistance;
}) {
  const map = useMap();

  const routingRef =
    useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    /* cleanup old route */

    if (routingRef.current) {
      try {
        routingRef.current
          .getPlan()
          ?.setWaypoints([]);

        routingRef.current.remove();

        routingRef.current = null;
      } catch (e) {}
    }

    const instance =
      L.Routing.control({
        waypoints: [
          L.latLng(
            userPos[0],
            userPos[1]
          ),

          L.latLng(
            depot.lat,
            depot.lng
          ),
        ],

        routeWhileDragging: false,

        addWaypoints: false,

        draggableWaypoints: false,

        fitSelectedRoutes: true,

        show: false,

        createMarker: () => null,

        lineOptions: {
          styles: [
            {
              color: "#ef4444",
              weight: 6,
            },
          ],
        },
      });

    instance.addTo(map);

    routingRef.current =
      instance;

    map.setView(
      [depot.lat, depot.lng],
      11
    );

    return () => {
      try {
        if (
          routingRef.current
        ) {
          routingRef.current
            .getPlan()
            ?.setWaypoints([]);

          routingRef.current.remove();

          routingRef.current = null;
        }
      } catch (e) {}
    };
  }, [map, userPos, depot]);

  return null;
}

export default function DepotMap() {
  const [userPos, setUserPos] =
    useState<
      [number, number] | null
    >(null);

  const [
    sortedDepots,
    setSortedDepots,
  ] = useState<
    DepotWithDistance[]
  >([]);

  const [search, setSearch] =
    useState("");

  const [
    selectedDepot,
    setSelectedDepot,
  ] = useState<DepotWithDistance | null>(
    null
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat =
          pos.coords.latitude;

        const lng =
          pos.coords.longitude;

        setUserPos([lat, lng]);

        const depotDistances =
          depots.map((depot) => ({
            ...depot,

            distance:
              calculateDistance(
                lat,
                lng,
                depot.lat,
                depot.lng
              ),
          }));

        depotDistances.sort(
          (a, b) =>
            a.distance -
            b.distance
        );

        setSortedDepots(
          depotDistances
        );

        setSelectedDepot(
          depotDistances[0]
        );
      },

      () => {
        /* fallback */

        const fallback: [
          number,
          number
        ] = [10.8505, 76.2711];

        setUserPos(fallback);

        const depotDistances =
          depots.map((depot) => ({
            ...depot,

            distance:
              calculateDistance(
                fallback[0],
                fallback[1],
                depot.lat,
                depot.lng
              ),
          }));

        depotDistances.sort(
          (a, b) =>
            a.distance -
            b.distance
        );

        setSortedDepots(
          depotDistances
        );

        setSelectedDepot(
          depotDistances[0]
        );
      }
    );
  }, []);

  const filteredDepots =
    useMemo(() => {
      if (!search.trim()) {
        return sortedDepots.slice(
          0,
          10
        );
      }

      return sortedDepots.filter(
        (depot) =>
          depot.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [search, sortedDepots]);

  const center =
    useMemo(() => {
      if (selectedDepot) {
        return [
          selectedDepot.lat,
          selectedDepot.lng,
        ] as [number, number];
      }

      if (userPos)
        return userPos;

      return [10.8505, 76.2711] as [
        number,
        number
      ];
    }, [selectedDepot, userPos]);

  return (
    <div className="space-y-5">

      <div className="rounded-3xl bg-white p-4 shadow-sm">

        <input
          type="text"
          placeholder="Search city or depot"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none"
        />

      </div>

      <div className="h-[45vh] max-h-[380px] overflow-hidden rounded-3xl shadow-sm">

        <MapContainer
          center={center}
          zoom={11}
          scrollWheelZoom={true}
          style={{
            height: "100%",
            width: "100%",
          }}
        >

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userPos && (
            <Marker
              position={userPos}
              icon={icon}
            >
              <Popup>
                Your Location
              </Popup>
            </Marker>
          )}

          {filteredDepots.map(
            (depot) => (
              <Marker
                key={depot.name}
                position={[
                  depot.lat,
                  depot.lng,
                ]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    setSelectedDepot(
                      depot
                    );
                  },
                }}
              >
                <Popup>

                  <div className="space-y-1">

                    <h3 className="font-bold">
                      {depot.name}
                    </h3>

                    <p>
                      {depot.distance.toFixed(
                        1
                      )}{" "}
                      km away
                    </p>

                    <a
                      href={`tel:${depot.phone}`}
                      className="text-blue-600"
                    >
                      Call Depot
                    </a>

                  </div>

                </Popup>
              </Marker>
            )
          )}

          {userPos &&
            selectedDepot && (
              <Routing
                userPos={
                  userPos
                }
                depot={
                  selectedDepot
                }
              />
            )}

        </MapContainer>

      </div>

      <div className="space-y-3">

        <div>

          <h2 className="text-2xl font-black">
            Nearby Depots
          </h2>

          <p className="text-gray-500">
            Sorted nearest to
            farthest
          </p>

        </div>

        {filteredDepots.map(
          (depot) => (
            <button
              key={depot.name}
              onClick={() =>
                setSelectedDepot(
                  depot
                )
              }
              className="w-full rounded-3xl bg-white p-4 text-left shadow-sm"
            >

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h3 className="text-xl font-bold">
                    {depot.name}
                  </h3>

                  <p className="text-gray-500">
                    {depot.distance.toFixed(
                      1
                    )}{" "}
                    km away
                  </p>

                  <p className="text-sm text-gray-400">
                    PIN:{" "}
                    {depot.pin}
                  </p>

                </div>

                <a
                  href={`tel:${depot.phone}`}
                  className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  Call
                </a>

              </div>

            </button>
          )
        )}

      </div>

    </div>
  );
}
