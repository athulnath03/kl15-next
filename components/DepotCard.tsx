import { Phone, Building2 } from "lucide-react";

type Props = {
  name: string;
  district?: string;
  phone: string;
};

export default function DepotCard({
  name,
  district,
  phone,
}: Props) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div className="flex gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Building2 />
          </div>

          <div>
            <h3 className="text-xl font-bold">
              {name}
            </h3>

            <p className="text-sm text-gray-500">
              {district}
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {phone}
            </p>
          </div>

        </div>

        <a
          href={`tel:${phone}`}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600"
        >
          <Phone size={20} />
        </a>

      </div>

    </div>
  );
}
