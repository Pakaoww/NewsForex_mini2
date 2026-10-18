import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

interface Props {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  disabled = false,
  onChange,
}: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav className="flex justify-center" aria-label="เลือกหน้า">
      <div className="join">
        <button
          type="button"
          className="btn join-item"
          disabled={disabled || page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="หน้าก่อนหน้า"
        >
          <ChevronLeftIcon width={16} height={16} />
        </button>
        <span className="btn join-item pointer-events-none">
          หน้า {page} / {totalPages}
        </span>
        <button
          type="button"
          className="btn join-item"
          disabled={disabled || page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="หน้าถัดไป"
        >
          <ChevronRightIcon width={16} height={16} />
        </button>
      </div>
    </nav>
  );
}
