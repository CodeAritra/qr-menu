/*import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

export default function CafeQRCode() {
  const cafeName = "debolina";
  const cafeId = "8LLZJ1ls0fhHugZFNtRFGta2PmR2";
  const tableCount = 5; // number of tables in the cafe

  const qrRefs = Array.from({ length: tableCount }, () => useRef(null));

  const downloadPDF = () => {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    let y = 80;

    pdf.setFontSize(18);
    pdf.text(`${cafeName} – Table QR Codes`, pageWidth / 2, 40, {
      align: "center",
    });

    qrRefs.forEach((ref, index) => {
      const canvas = ref.current;
      if (!canvas) return;

      const dataUrl = canvas.toDataURL("image/png");
      const imgSize = 128;
      const x = (pageWidth - imgSize) / 2;

      pdf.setFontSize(14);
      pdf.text(`Table ${index + 1}`, pageWidth / 2, y - 10, {
        align: "center",
      });
      pdf.addImage(dataUrl, "PNG", x, y, imgSize, imgSize);

      y += imgSize + 50; // space between codes
      if (y > pdf.internal.pageSize.getHeight() - 150) {
        pdf.addPage();
        y = 80;
      }
    });

    pdf.save(`${cafeName}-tables.pdf`);
  };

  return (
    <div className="p-6 text-center">
      <div className="grid grid-cols-2 gap-6 justify-items-center">
        {Array.from({ length: tableCount }).map((_, index) => {
          const menuUrl = `https://qr-menu-ed60e.web.app/${cafeName}/${cafeId}?table=${index + 1}`;
          return (
            <div
              key={index}
              className="inline-block bg-white p-4 rounded-lg shadow"
            >
              <QRCodeCanvas
                ref={qrRefs[index]}
                value={menuUrl}
                size={150}
              />
              <p className="mt-2 font-bold">Table {index + 1}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <button className="btn btn-primary" onClick={downloadPDF}>
          Download All QR Codes (PDF)
        </button>
      </div>
    </div>
  );
}*/


import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

export default function CafeQRCode() {
  const [menuUrl, setMenuUrl] = useState("");
  const [tableCount, setTableCount] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const qrRefs = useRef([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const downloadPDF = () => {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    let y = 80;

    pdf.setFontSize(18);
    pdf.text(`Cafe QR Codes`, pageWidth / 2, 40, { align: "center" });

    qrRefs.current.forEach((divRef, index) => {
      if (!divRef) return;
      const canvas = divRef.querySelector("canvas");
      if (!canvas) return;

      const dataUrl = canvas.toDataURL("image/png");
      const imgSize = 128;
      const x = (pageWidth - imgSize) / 2;

      pdf.setFontSize(14);
      pdf.text(`Table ${index + 1}`, pageWidth / 2, y - 10, { align: "center" });
      pdf.addImage(dataUrl, "PNG", x, y, imgSize, imgSize);

      y += imgSize + 50;
      if (y > pdf.internal.pageSize.getHeight() - 150) {
        pdf.addPage();
        y = 80;
      }
    });

    pdf.save(`tables.pdf`);
  };

  return (
    <div className="p-6 text-center">
      {!submitted ? (
        // 📌 Step 1: Form
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto bg-base-200 p-6 rounded-lg shadow space-y-4"
        >
          <h2 className="text-2xl font-bold">Generate QR Codes</h2>

          <input
            type="text"
            placeholder="Enter menu link"
            className="input input-bordered w-full"
            value={menuUrl}
            onChange={(e) => setMenuUrl(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Enter number of tables"
            className="input input-bordered w-full"
            value={tableCount}
            onChange={(e) => setTableCount(Number(e.target.value))}
            min="1"
            required
          />

          <button type="submit" className="btn btn-primary w-full">
            Generate
          </button>
        </form>
      ) : (
        // 📌 Step 2: Generated QRs
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
            {Array.from({ length: tableCount }).map((_, index) => {
              const tableUrl = `${menuUrl}?table=${index + 1}`;
              return (
                <div
                  key={index}
                  ref={(el) => (qrRefs.current[index] = el)}
                  className="bg-white p-4 rounded-lg shadow"
                >
                  <QRCodeCanvas value={tableUrl} size={150} />
                  <p className="mt-2 font-bold">Table {index + 1}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <button className="btn btn-primary" onClick={downloadPDF}>
              Download All (PDF)
            </button>
            <button
              className="btn"
              onClick={() => setSubmitted(false)}
            >
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
