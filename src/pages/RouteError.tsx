import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import EmptyState from "../components/EmptyState";

/** ErrorBoundary ระดับ router — ดักข้อผิดพลาดที่ไม่คาดคิดตอน render */
export default function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";

  return (
    <div className="mx-auto max-w-xl p-6">
      <EmptyState title="เกิดข้อผิดพลาด" description={message}>
        <Link to="/" className="btn btn-primary btn-sm">
          กลับหน้าแรก
        </Link>
      </EmptyState>
    </div>
  );
}
