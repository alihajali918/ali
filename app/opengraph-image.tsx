import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Ali Hajali | مبرمج مواقع احترافي";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// satori lays out multi-word text in source order without applying bidi
// reordering, so RTL lines must be pre-reversed word-by-word here.
const rtl = (text: string) => text.split(" ").reverse().join(" ");

export default async function Image() {
  const [bold, regular] = await Promise.all([
    readFile(join(process.cwd(), "public/IBMPlexSansArabic-Bold.ttf")),
    readFile(join(process.cwd(), "public/IBMPlexSansArabic-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0A",
          position: "relative",
          fontFamily: "IBM Plex Sans Arabic",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -160,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "#00F5D4",
            opacity: 0.22,
            filter: "blur(120px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -160,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "#7B61FF",
            opacity: 0.22,
            filter: "blur(120px)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            padding: "0 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 24px",
              borderRadius: 999,
              border: "1px solid rgba(0,245,212,0.35)",
              background: "rgba(0,245,212,0.06)",
              color: "#00F5D4",
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            alihajali.com
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            Ali Hajali
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 46,
              fontWeight: 600,
              backgroundImage: "linear-gradient(135deg, #00F5D4 0%, #7B61FF 100%)",
              backgroundClip: "text",
              color: "transparent",
              direction: "rtl",
            }}
          >
            {rtl("مبرمج مواقع احترافي")}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            {[
              "مبرمج مواقع في قطر متخصص بـ Next.js",
              "مواقع تعريفية، متاجر إلكترونية، وأنظمة إدارة مخصصة.",
              "من الفكرة للإطلاق، بسرعة وباحترافية.",
            ].map(line => (
              <div
                key={line}
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.65)",
                  direction: "rtl",
                }}
              >
                {rtl(line)}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "IBM Plex Sans Arabic", data: bold, weight: 700, style: "normal" },
        { name: "IBM Plex Sans Arabic", data: regular, weight: 400, style: "normal" },
      ],
    }
  );
}
