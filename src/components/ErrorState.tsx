import { AlertIcon, RefreshIcon } from "./Icons";

interface Props {
  title?: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export default function ErrorState({
  title = "โหลดข้อมูลไม่สำเร็จ",
  message,
  onRetry,
  retrying = false,
}: Props) {
  return (
    <div role="alert" className="card card-border border-error/40 bg-base-100">
      <div className="card-body items-center gap-2 text-center">
        <span className="text-error">
          <AlertIcon width={32} height={32} />
        </span>
        <h3 className="card-title">{title}</h3>
        <p className="text-sm text-base-content/70">{message}</p>
        {onRetry && (
          <button
            type="button"
            className="btn btn-error btn-sm mt-2"
            onClick={onRetry}
            disabled={retrying}
          >
            {retrying ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <RefreshIcon width={16} height={16} />
            )}
            ลองใหม่อีกครั้ง
          </button>
        )}
      </div>
    </div>
  );
}
