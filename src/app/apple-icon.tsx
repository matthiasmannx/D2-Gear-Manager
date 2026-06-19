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
          background:
            "radial-gradient(circle at 50% 38%, #ffd27a 0%, #f5a623 45%, #0b0e14 100%)",
          borderRadius: 36,
          color: "#ffffff",
          fontSize: 112,
          fontWeight: 900,
          letterSpacing: "-0.06em",
        }}
      >
        G
      </div>
    ),
    size,
  );
}
