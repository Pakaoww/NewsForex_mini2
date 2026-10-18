import type { Impact } from "../types/calendar";
import { IMPACT_BADGE, IMPACT_LABEL } from "../lib/format";

interface Props {
  impact: Impact;
}

export default function ImpactBadge({ impact }: Props) {
  return (
    <span className={`badge ${IMPACT_BADGE[impact] ?? "badge-ghost"}`}>
      {IMPACT_LABEL[impact] ?? impact}
    </span>
  );
}
