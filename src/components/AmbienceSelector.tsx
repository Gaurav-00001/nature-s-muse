import { Trees, Waves, Mountain } from "lucide-react";
import type { Ambience } from "@/lib/types";
import { cn } from "@/lib/utils";

const ambiences: { value: Ambience; label: string; icon: typeof Trees; desc: string }[] = [
  { value: "forest", label: "Forest", icon: Trees, desc: "Deep woods calm" },
  { value: "ocean", label: "Ocean", icon: Waves, desc: "Tidal serenity" },
  { value: "mountain", label: "Mountain", icon: Mountain, desc: "Alpine stillness" },
];

const ambienceStyles: Record<Ambience, string> = {
  forest: "border-forest/30 bg-forest-light text-forest hover:border-forest/60",
  ocean: "border-ocean/30 bg-ocean-light text-ocean hover:border-ocean/60",
  mountain: "border-mountain/30 bg-mountain-light text-mountain hover:border-mountain/60",
};

const ambienceActiveStyles: Record<Ambience, string> = {
  forest: "border-forest bg-forest text-primary-foreground shadow-md",
  ocean: "border-ocean bg-ocean text-primary-foreground shadow-md",
  mountain: "border-mountain bg-mountain text-primary-foreground shadow-md",
};

interface Props {
  value: Ambience | null;
  onChange: (v: Ambience) => void;
}

export default function AmbienceSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ambiences.map((a) => {
        const Icon = a.icon;
        const active = value === a.value;
        return (
          <button
            key={a.value}
            type="button"
            onClick={() => onChange(a.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
              active ? ambienceActiveStyles[a.value] : ambienceStyles[a.value]
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="text-sm font-semibold">{a.label}</span>
            <span className={cn("text-xs", active ? "opacity-80" : "opacity-60")}>{a.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
