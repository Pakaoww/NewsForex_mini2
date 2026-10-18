import type { ReactNode } from "react";
import { CalendarIcon } from "./Icons";

interface Props {
  title: string;
  description?: string;
  children?: ReactNode;
}

export default function EmptyState({ title, description, children }: Props) {
  return (
    <div className="card card-border bg-base-100">
      <div className="card-body items-center gap-2 py-10 text-center">
        <span className="text-base-content/40">
          <CalendarIcon width={36} height={36} />
        </span>
        <h3 className="card-title">{title}</h3>
        {description && (
          <p className="text-sm text-base-content/70">{description}</p>
        )}
        {children && <div className="card-actions mt-2">{children}</div>}
      </div>
    </div>
  );
}
