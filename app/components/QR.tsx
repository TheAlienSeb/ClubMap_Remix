
import { useQRCode } from 'next-qrcode';

function QR({ text }: {text:string}) {
  const { SVG } = useQRCode();

  return (
    <SVG
      text={text}
      options={{
        margin: 2,
        width: 375,
        color: {
          dark: '#010599FF',
          light: '#FFFFFFFF',
        },
      }}
    />
  );
}

export default QR;
