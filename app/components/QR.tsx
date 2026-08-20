import { useQRCode } from "next-qrcode";

function QR({ text, size = 280 }: { text: string; size?: number }) {
  const { SVG } = useQRCode();

  return (
    <SVG
      text={text}
      options={{
        margin: 2,
        width: size,
        color: {
          dark: "#050505FF",
          light: "#FFFFFFFF",
        },
      }}
    />
  );
}

export default QR;
