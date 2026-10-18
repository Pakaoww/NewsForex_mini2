import { Link } from "react-router";
import EmptyState from "../components/EmptyState";

export default function NotFoundPage() {
  return (
    <EmptyState
      title="ไม่พบหน้าที่ต้องการ (404)"
      description="ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกย้ายไปแล้ว"
    >
      <Link to="/" className="btn btn-primary btn-sm">
        กลับหน้าแรก
      </Link>
    </EmptyState>
  );
}
