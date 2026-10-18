import type { ReactNode, SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const icon = (children: ReactNode) =>
  function Icon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg {...base} {...props}>
        {children}
      </svg>
    );
  };

export const HomeIcon = icon(
  <>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </>,
);
export const SearchIcon = icon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </>,
);
export const BookmarkIcon = icon(<path d="M6 3h12v18l-6-4-6 4z" />);
export function BookmarkFilledIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M6 3h12v18l-6-4-6 4z" />
    </svg>
  );
}
export const InfoIcon = icon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </>,
);
export const ChartIcon = icon(
  <>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </>,
);
export const CalendarIcon = icon(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </>,
);
export const NewsIcon = icon(
  <>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </>,
);
export const ArrowLeftIcon = icon(
  <>
    <path d="M19 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </>,
);
export const ChevronLeftIcon = icon(<path d="M15 6l-6 6 6 6" />);
export const ChevronRightIcon = icon(<path d="M9 6l6 6-6 6" />);
export const SunIcon = icon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>,
);
export const MoonIcon = icon(
  <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />,
);
export const RefreshIcon = icon(
  <>
    <path d="M21 12a9 9 0 11-3-6.7" />
    <path d="M21 3v6h-6" />
  </>,
);
export const AlertIcon = icon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6" />
    <path d="M12 16.5h.01" />
  </>,
);
export const ExternalIcon = icon(
  <>
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
  </>,
);
