"use client";

import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DISTRICT_COORDS, ALL_AKTAU_DISTRICTS } from "./districts";

// Re-export for backward compatibility
export { DISTRICT_COORDS, ALL_AKTAU_DISTRICTS };

// Fix Leaflet default icon in Next.js (only client-side)
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface MapJob {
  id: string;
  title: string;
  district: string;
  salaryText?: string;
  salaryMin?: number;
  contact?: string;
  lat?: number;
  lng?: number;
}

function getCoords(job: MapJob): [number, number] {
  if (job.lat && job.lng) return [job.lat, job.lng];
  return DISTRICT_COORDS[job.district] ?? [43.6450, 51.1450];
}

export default function JobsMap({ jobs }: { jobs: MapJob[] }) {
  return (
    <MapContainer
      center={[43.6500, 51.1420]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      className="rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {jobs.map((job) => {
        const coords = getCoords(job);
        return (
          <Marker key={job.id} position={coords}>
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-bold text-slate-900 text-sm">{job.title}</p>
                <p className="text-indigo-600 font-semibold text-sm mt-0.5">
                  {job.salaryText || (job.salaryMin && job.salaryMin > 0 ? `от ${job.salaryMin.toLocaleString()} ₸` : "По договорённости")}
                </p>
                <p className="text-slate-500 text-xs mt-1">📍 {job.district}</p>
                <a href={`/vacancies/${job.id}`} className="block mt-2 text-xs font-semibold text-indigo-600 hover:underline">Открыть вакансию →</a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
