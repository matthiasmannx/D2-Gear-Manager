import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0e14",
          borderRadius: 36,
          boxShadow: "inset 0 0 0 6px rgba(245, 166, 35, 0.16)",
        }}
      >
        {/* Diamant-merkteken als gedraaid vierkant (geen font nodig). */}
        <div
          style={{
            width: 84,
            height: 84,
            background: "#f5a623",
            borderRadius: 18,
            transform: "rotate(45deg)",
          }}
        />
      </div>
    ),
    size,
  );
}
