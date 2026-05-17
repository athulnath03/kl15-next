"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function RefreshMapControl({
  refreshLocation,
}: {
  refreshLocation: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    const RefreshControl = L.Control.extend({
      options: {
        position: "topleft",
      },

      onAdd: function () {
        const btn = L.DomUtil.create("button");

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
  }, [map, refreshLocation]);

  return null;
}
