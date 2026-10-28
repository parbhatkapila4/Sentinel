import type { CSSProperties } from "react";

type Size = number | string;

export function Bone({
  w,
  h,
  r,
  style,
  className,
}: {
  w: Size;
  h: Size;
  r?: Size;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <span
      className={className ? `dl-skel ${className}` : "dl-skel"}
      style={{
        width: w,
        height: h,
        ...(r === undefined ? {} : { borderRadius: r }),
        ...style,
      }}
    />
  );
}

export function Line({
  w,
  lh,
  h = 9,
  style,
}: {
  w: Size;
  lh: number;
  h?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{ display: "flex", alignItems: "center", height: lh, ...style }}
    >
      <Bone w={w} h={h} />
    </span>
  );
}
