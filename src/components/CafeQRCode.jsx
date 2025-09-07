// CafeQRCode.jsx
import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

export default function CafeQRCode() {
  const qrRef = useRef(null);

  const cafeName = "aritra";
  const cafeId = "YefNZlosfzWnsZOhqCQP5OGbGm33";
  // const menuUrl = `https://myqrmenu.com/${cafeName}/${cafeId}`;
  const menuUrl = `qr-menu-ed60e.web.app/${cafeName}/${cafeId}`;

  /*const downloadPNG = () => {
    const canvas = qrRef.current; // <canvas> element
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${cafeName}-qr.png`;
    a.click();
  };*/

  const downloadPDF = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png"); // keep PNG for crisp QR

    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgSize = 256; // points
    const x = (pageWidth - imgSize) / 2;
    const y = 140;

    pdf.setFontSize(18);
    pdf.text(`${cafeName} – Menu`, pageWidth / 2, 90, { align: "center" });
    pdf.addImage(dataUrl, "PNG", x, y, imgSize, imgSize);
    pdf.setFontSize(11);
    // pdf.text(menuUrl, pageWidth / 2, y + imgSize + 24, {
    //   align: "center",
    //   maxWidth: pageWidth - 72,
    // });
    pdf.save(`${cafeName}-qr.pdf`);
  };

  return (
    <div className="p-6 text-center">
      <div className="inline-block bg-white p-4 rounded-lg shadow">
        <QRCodeCanvas
          ref={qrRef} // 👈 this is the key
          value={menuUrl}
          size={256}
          id="qr-canvas" // optional fallback selector
        />
      </div>

      <div className="mt-4 flex gap-2 justify-center">
        <button className="btn btn-primary" onClick={downloadPDF}>
          Download PDF
        </button>
      </div>
    </div>
  );
}
