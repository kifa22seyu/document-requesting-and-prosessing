import { useState, useRef } from "react";
import Tesseract from "tesseract.js";

export default function IdentityVerificationForm() {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [frontIdIdentified, setFrontIdIdentified] = useState(null);
  const [backIdIdentified, setBackIdIdentified] = useState(null);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  // Function to check whether the ID is front or back
  const binanceIdCheck = (text) => {
    const frontKeywords = /ስም\/Name|የተወለደበት ቀን|መታወቂያ ቁጥር|የመኖርያ አድራሻ|Resident Address/i;
    const backKeywords = /የተሰጠበት ቀን|የሚያልቅበት ቀን|የተሰጠበት ቦታ|ፊርማ|Resident Address|ስልክ ቁጥር/i;

    if (frontKeywords.test(text) && !backKeywords.test(text)) {
      return "front";
    } else if (backKeywords.test(text) && !frontKeywords.test(text)) {
      return "back";
    } else {
      return null;
    }
  };

  // Function to identify if uploaded image is front or back
  const identifySide = async (file, setImage, sideSetter, isFront) => {
    if (!file || !["image/jpeg", "image/png"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Invalid file format or size exceeds 5MB.");
      return;
    }

    setImage(URL.createObjectURL(file));
    setError("");
    setStatus("Analyzing...");

    try {
      const { data: { text } } = await Tesseract.recognize(file, "amh+eng");
      console.log("Extracted Text:", text); // Debugging Line

      const detectedSide = binanceIdCheck(text);

      if (detectedSide === "front") {
        sideSetter(true); // True for front identified
        setStatus("Front of ID detected.");
        if (isFront) {
          setFrontIdIdentified(true);
          setBackIdIdentified(null);
        } else {
          setFrontIdIdentified(true);
          setBackIdIdentified(null);
        }
      } else if (detectedSide === "back") {
        sideSetter(true); // True for back identified
        setStatus("Back of ID detected.");
        if (!isFront) {
          setBackIdIdentified(true);
          setFrontIdIdentified(null);
        } else {
          setBackIdIdentified(true);
          setFrontIdIdentified(null);
        }
      } else {
        if (isFront) {
          setFrontIdIdentified(false);
        } else {
          setBackIdIdentified(false);
        }
        setError("Could not determine front or back. Please check the image.");
      }
    } catch (error) {
      console.error("OCR Error:", error);
      setError("Error processing the image.");
      if (isFront) {
        setFrontIdIdentified(false);
      } else {
        setBackIdIdentified(false);
      }
    } finally {
      setStatus("");
    }
  };

  const handleFileChange = (event, setImage, isFront) => {
    const file = event.target.files[0];
    if (!file) return;
    if (isFront) {
      identifySide(file, setImage, setFrontIdIdentified, true);
    } else {
      identifySide(file, setImage, setBackIdIdentified, false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!frontImage || !backImage) {
      setError("Please upload both front and back images of your ID.");
      return;
    }
    if (frontIdIdentified === false || backIdIdentified === false) {
      setError("Front/Back ID not detected. Please re-upload.");
      return;
    }
    if (!frontIdIdentified) {
      setError("Front ID not detected. Please re-upload.");
      return;
    }
    if (!backIdIdentified) {
      setError("Back ID not detected. Please re-upload.");
      return;
    }
    console.log("Form submitted successfully!");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-2xl">
      <h2 className="text-xl font-semibold mb-4 text-center">Verify Your Identity</h2>
      {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
      {status && <p className="text-blue-500 text-sm mb-2 text-center">{status}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Front ID Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Upload Front of ID</label>
          <input
            type="file"
            accept=".jpeg, .jpg, .png"
            ref={frontInputRef}
            onChange={(e) => handleFileChange(e, setFrontImage, true)}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-gray-50 hover:file:bg-gray-100"
          />
          {frontImage && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Front ID Preview:</p>
              <img src={frontImage} alt="Front ID Preview" className="w-full h-32 object-cover rounded-lg" />
            </div>
          )}
          {frontIdIdentified === false && frontImage && (
            <p className="text-red-500 text-sm mt-2 text-center">
              The uploaded front ID image could not be correctly identified. Please try again.
            </p>
          )}
        </div>

        {/* Back ID Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Upload Back of ID</label>
          <input
            type="file"
            accept=".jpeg, .jpg, .png"
            ref={backInputRef}
            onChange={(e) => handleFileChange(e, setBackImage, false)}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-gray-50 hover:file:bg-gray-100"
          />
          {backImage && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Back ID Preview:</p>
              <img src={backImage} alt="Back ID Preview" className="w-full h-32 object-cover rounded-lg" />
            </div>
          )}
          {backIdIdentified === false && backImage && (
            <p className="text-red-500 text-sm mt-2 text-center">
              The uploaded back ID image could not be correctly identified. Please try again.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
}