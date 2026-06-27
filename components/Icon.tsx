import Image from "next/image";

export type IconName =
  | "onsen"
  | "hotel"
  | "train"
  | "checklist"
  | "budget"
  | "date";

/** Renders one of the brand SVG icons from the asset kit. */
export function Icon({
  name,
  size = 24,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/assets/images/icon-${name}.svg`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      unoptimized
      className={className}
    />
  );
}
