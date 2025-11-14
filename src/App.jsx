import { useState, useEffect } from "react";
// ⭐️ import ไอคอนมาให้ครบ (แก้ไขชื่อไอคอนที่ผิด)
import {
  Camera,
  Heart,
  Video,
  MessageCircleQuestion,
  Save,
  Star,
  Cat,
} from "lucide-react";
import { FaHandPointLeft, FaHandPointRight } from "react-icons/fa";

// -----------------
// ไอคอน SVG (สำหรับปุ่ม)
// -----------------

// Component สำหรับแสดงสถานะ Loading
const Spinner = () => (
  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
);

// -----------------
// URL ของ Backend (Laravel API)
// -----------------
const API_BASE_URL = "https://dev.dpujam.com/api"; // ⭐️ ตรวจสอบว่านี่คือ URL ที่ถูกต้อง

export default function App() {
  // -----------------
  // State ทั้งหมดของแอป
  // -----------------
  // ⭐️ Step logic ใหม่:
  // 1 = สร้างภาพ
  // 2 = คำถามข้อ 1 (อายุ)
  // 3 = คำถามข้อ 2 (กิจกรรม)
  // 4 = หน้าสรุปผล (อาหาร)
  // 5 = หน้าสร้าง/แสดงวิดีโอ
  const [step, setStep] = useState(1);
  const [catName, setCatName] = useState("");
  const [originalImageFile, setOriginalImageFile] = useState(null);
  const [originalImagePreview, setOriginalImagePreview] = useState("");

  // State สำหรับผลลัพธ์
  const [generatedImageData, setGeneratedImageData] = useState(null); // { id: '...', url: '...' }
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState("");

  // ⭐️ State สำหรับคำถาม
  const [catAge, setCatAge] = useState(null); // '<1' หรือ '>=1'
  const [activityLevel, setActivityLevel] = useState(null); // 'high' หรือ 'low'
  const [recommendedFood, setRecommendedFood] = useState(null); // 'kitten', 'active', 'indoor'

  // State สำหรับการโหลด
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  // ⭐️ State for reaction animation (0=hidden, 1=msg1, 2=msg2, 3=msg3)
  const [reactionStep, setReactionStep] = useState(0);

  // -----------------
const handleDownloadVideo = async () => {
    if (!generatedVideoUrl) return;

    try {
      // 1. Fetch the video data
      const response = await fetch(generatedVideoUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // 2. Get the data as a Blob
      const blob = await response.blob();
      
      // 3. Create a local URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // 4. Create a temporary 'a' tag to trigger the download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${catName || 'cat'}_video.mp4`; // Suggest a filename
      
      // 5. Click the link programmatically
      document.body.appendChild(link);
      link.click();
      
      // 6. Clean up by removing the link and revoking the blob URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error('Error downloading the video:', error);
      alert('Could not download the video.');
    }
  };
  // เมื่อเลือกไฟล์
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalImageFile(file);
      setOriginalImagePreview(URL.createObjectURL(file));
      // รีเซ็ตค่าเมื่อเลือกรูปใหม่
      setGeneratedImageData(null);
      setGeneratedVideoUrl("");
      setStep(1);
    }
  };

  // ⭐️ เมื่อกด "สร้างภาพแมว" (ขั้นตอนที่ 1)
  const handleSubmitImage = async (e) => {
    e.preventDefault();
    if (!originalImageFile || !catName) {
      alert("กรุณาใส่ชื่อและอัปโหลดรูปก่อนครับ");
      return;
    }
    setIsLoadingImage(true);
    setGeneratedImageData(null);
    setGeneratedVideoUrl("");

    const formData = new FormData();
    formData.append("catName", catName);
    formData.append("imageFile", originalImageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/imagen`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
      }

      setGeneratedImageData(result);
      // ⭐️ ไม่ต้อง setStep(2) ที่นี่ ปล่อยให้ UI step 1 แสดงผลลัพธ์
    } catch (error) {
      console.error(error);
      alert(`เกิดข้อผิดพลาดในการสร้างภาพ: ${error.message}`);
    } finally {
      setIsLoadingImage(false);
    }
  };

  // ⭐️ ฟังก์ชันใหม่: เมื่อเลือกอายุ (คำถาม 1)
  const handleAgeSelect = (age) => {
    setCatAge(age);
    if (age === "<1") {
      // แมวเด็ก ไปหน้าสรุปผลเลย
      setRecommendedFood("kitten");
      setStep(4);
    } else {
      // แมวโต ไปคำถาม 2
      setStep(3);
    }
  };

  // ⭐️ ฟังก์ชันใหม่: เมื่อเลือกกิจกรรม (คำถาม 2)
  const handleActivitySelect = (level) => {
    setActivityLevel(level);
    if (level === "high") {
      setRecommendedFood("active");
    } else {
      setRecommendedFood("indoor");
    }
    setStep(4); // ไปหน้าสรุปผล
  };

  // ⭐️ New function to handle Facebook Share
  const handleShareToFacebook = () => {
    if (!generatedVideoUrl) {
        alert('กรุณาสร้างวิดีโอก่อนแชร์');
      return;
            }

    // Customize your share URL
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generatedVideoUrl)}&quote=${encodeURIComponent(`มาดู ${catName} ชิม ${getFoodDisplayName(recommendedFood)}! #PawdyAI #CatFood`)}`;

     // Open in a new window/tab
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // ⭐️ เมื่อกด "สร้างวิดีโอ" (ย้ายไปขั้นตอนที่ 5)
  const handleSubmitVideo = async () => {
    if (!generatedImageData || !generatedImageData.id) {
      alert("เกิดข้อผิดพลาด: ไม่พบ ID รูปภาพที่สร้าง");
      return;
    }

    setIsLoadingVideo(true);
    setGeneratedVideoUrl("");

    try {
      const response = await fetch(`${API_BASE_URL}/imagen-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          imageId: generatedImageData.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
      }

      setGeneratedVideoUrl(result.url);
      // ⭐️ Reset reaction state
      setReactionStep(0);
      // ⭐️ ไม่ต้อง setStep(3) แล้ว เพราะยังอยู่ใน step 5
    } catch (error) {
      console.error(error);
      alert(`เกิดข้อผิดพลาดในการสร้างวิดีโอ: ${error.message}`);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  // ฟังก์ชันสำหรับกลับไปเริ่มต้นใหม่
  const handleReset = () => {
    setStep(1);
    setCatName("");
    setOriginalImageFile(null);
    setOriginalImagePreview("");
    setGeneratedImageData(null);
    setGeneratedVideoUrl("");
    setIsLoadingImage(false);
    setIsLoadingVideo(false);
    // ⭐️ รีเซ็ต state คำถามด้วย
    setCatAge(null);
    setActivityLevel(null);
    setRecommendedFood(null);
    // ⭐️ Reset reaction state
    setReactionStep(0);
  };

  // ⭐️ Effect to trigger reaction sequence
  useEffect(() => {
    // Clear existing timeouts if any (good practice)
    let timer1;
    let timer2;
    let timer3;

    if (generatedVideoUrl) {
      // Reset step on new video, in case it's re-triggered
      setReactionStep(0);

      // Start the sequence
      timer1 = setTimeout(() => {
        setReactionStep(1); // Show msg 1
      }, 500); // "อร่อยมาก!" after 0.5s

      timer2 = setTimeout(() => {
        setReactionStep(2); // Show msg 2
      }, 1500); // "ยอดไปเลย!" after 1.5s (1s after msg 1)

      timer3 = setTimeout(() => {
        setReactionStep(3); // Show msg 3
      }, 2500); // "คะแนน 5/5" after 2.5s (1s after msg 2)
    }

    // Cleanup function to clear timeouts if component unmounts or videoUrl changes
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [generatedVideoUrl]); // Dependency array: only runs when generatedVideoUrl changes

  // ⭐️ ฟังก์ชันสำหรับแสดงผลลัพธ์อาหาร
  const renderFoodRecommendation = () => {
    let foodData = {
      title: "",
      imageUrl: "",
      description: "",
    };

    switch (recommendedFood) {
      case "kitten":
        foodData = {
          title: "สำหรับเจ้าเหมียวเด็ก (Kitten Formula)",
          imageUrl: "./01.jpg",
          description:
            "สูตร:ทูน่าพลัสนมแพะ เสริมสร้างภูมิคุ้มกันเพื่อพัฒนาการที่สมบูรณ์ เหมาะมากสำหรับวัยกำลังโต",
        };
        break;
      case "active":
        foodData = {
          title: "สำหรับเจ้าเหมียวตัวแสบ (Feline Active Cat Formula)",
          imageUrl: "./02.jpg",
          description:
            "แมวสายลุยต้องหมุนได้ไม่หยุด 🐾 สูตรแกะและทูน่าผสมกุ้ง เสริมกล้ามเนื้อ ดูแลข้อต่อ ให้พร้อมทุกกิจกรรม",
        };
        break;
      case "indoor":
        foodData = {
          title: "สำหรับเจ้าเหมียวสายนอน  (Indoor Cat Formula)",
          imageUrl: "./03.jpg",
          description:
            "แมวเลี้ยงในบ้าน/คอนโดก็ฟินได้ ✨ ทูน่า + เนื้อจระเข้ โปรตีนคุณภาพสูง  เเพ้ง่าย ต้องลอง",
        };
        break;
      default:
        return <p>ไม่พบข้อมูลอาหารที่แนะนำ</p>;
    }

    return (
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-700">
          {foodData.title}
        </h3>
        <img
          src={foodData.imageUrl}
          alt={foodData.title}
          className="mt-4 inline-block h-48 w-48 rounded-lg object-cover shadow-md"
        />
        <p className="mt-4 text-gray-600">{foodData.description}</p>
      </div>
    );
  };

  // ⭐️ ฟังก์ชันใหม่: สำหรับดึงชื่ออาหารที่แสดง
  const getFoodDisplayName = (key) => {
    switch (key) {
      case "kitten":
        return "อาหารแมวเด็ก";
      case "active":
        return "สูตร Active Cat";
      case "indoor":
        return "สูตร Indoor Cat";
      default:
        return "อาหารแมว";
    }
  };

  // -----------------
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#628966] py-12 px-4">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-[#eee7d3]">Pawdy AI</h1>
        <p className="mt-2 text-lg text-[#eee7d3]">
          เเปลงร่างเจ้าเหมียวให้กลายเป็นตัวการ์ตูนสุดคิวท์
        </p>
      </header>

      {/* ----------------------------------- */}
      {/* 1. หน้าจอสร้างภาพ (Image Gen) */}
      {/* ----------------------------------- */}
      <main className="mt-8 w-full max-w-lg">
        {step === 1 && (
          <>
            <form
              onSubmit={handleSubmitImage}
              className="rounded-2xl bg-gray-50 p-6 shadow-lg sm:p-8"
            >
              <h2 className="mb-6 text-2xl font-semibold text-gray-700">
                ขั้นตอนที่ 1: ข้อมูลของเจ้าเหมียว
              </h2>

              {/* ชื่อแมว */}
              <div className="mb-6">
                <label
                  htmlFor="catName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  ชื่อเจ้าเหมียวของคุณ
                </label>
                <input
                  type="text"
                  id="catName"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="เช่น เจ้าสามสี"
                  required
                />
              </div>

              {/* อัปโหลด */}
              <div className="mb-6">
                <label
                  htmlFor="catImage"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  อัปโหลดรูปสุดคิวท์ของเจ้าเหมียว
                </label>
                <input
                  type="file"
                  id="catImage"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-900 file:mr-4 file:rounded-lg file:border-0 file:bg-[#fbb045] file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-300"
                  accept="image/*"
                  required={!originalImageFile}
                />
              </div>

              {/* พรีวิวรูปที่อัปโหลด */}
              {originalImagePreview && (
                <div className="mb-6 text-center">
                  <p className="text-sm text-gray-500">รูปต้นฉบับ:</p>
                  <img
                    src={originalImagePreview}
                    alt="Cat preview"
                    className="mt-2 inline-block h-32 w-32 rounded-lg object-cover"
                  />
                </div>
              )}

              {/* ปุ่มสร้างภาพ */}
              <button
                type="submit"
                disabled={isLoadingImage}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#cbd183] py-3 px-4 text-base font-semibold text-gray-700 shadow-md transition hover:bg-[#838849] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingImage ? <Spinner /> : ""}
                {isLoadingImage
                  ? "กำลังสร้างภาพ..."
                  : "Animagus🪄 ได้เวลาแปลงร่างเจ้าเหมียว"}
              </button>
            </form>
            <div className="mt-8 text-center">
              <img
                src="./catnip.png"
                alt="Cute Cat"
                className="mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl h-auto"
              />
            </div>
          </>
        )}

        {/* ----------------------------------- */}
        {/* 2. หน้าจอคำถาม 1 (อายุ) */}
        {/* ----------------------------------- */}
        {step === 2 && (
          <div className="rounded-2xl bg-[#eee7d3] p-6 shadow-lg sm:p-8">
            <h2 className="mb-6 text-center text-2xl font-semibold text-gray-700">
              ขั้นตอนที่ 2 คำถามเกี่ยวกับเจ้าเหมียว
            </h2>
            <p className="mb-6 text-center text-lg text-gray-600">
              อายุของเจ้าเหมียว
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleAgeSelect("<1")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#9ac93c] py-3 px-4 text-base font-semibold text-[#fff9e6] shadow-md transition hover:bg-[#9ac93c]"
              >
                ต่ำกว่า 1 ปี (แมวเด็ก) <Cat />
              </button>
              <button
                onClick={() => handleAgeSelect(">=1")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#fbb045] py-3 px-4 text-base font-semibold text-[#fff9e6] shadow-md transition hover:bg-[#fbb045]"
              >
                1 ปีขึ้นไป (แมวโต) <Cat />
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------- */}
        {/* 3. หน้าจอคำถาม 2 (กิจกรรม) */}
        {/* ----------------------------------- */}
        {step === 3 && (
          <div className="rounded-2xl bg-[#eee7d3] p-6 shadow-lg sm:p-8">
            <h2 className="mb-6 text-center text-2xl font-semibold text-gray-700">
              ขั้นตอนที่ 2 คำถามเกี่ยวกับเจ้าเหมียว
            </h2>
            <p className="mb-6 text-center text-lg text-gray-600">
              นิสัยของเจ้าเหมียว
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleActivitySelect("high")}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#9ac93c] py-3 px-4 text-base font-semibold text-[#fff9e6] shadow-md transition hover:bg-[#9ac93c]"
              >
                ชอบวิ่งเล่น อยู่ไม่ค่อยนิ่ง
              </button>
              <button
                onClick={() => handleActivitySelect("high")}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#fbb045] py-3 px-4 text-base font-semibold text-[#fff9e6] shadow-md transition hover:bg-[#fbb045]"
              >
                พลังงานเยอะ
              </button>
              <button
                onClick={() => handleActivitySelect("low")}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#9ac93c] py-3 px-4 text-base font-semibold text-[#fff9e6] shadow-md transition hover:bg-[#9ac93c]"
              >
                ชอบนอน ทำกิจกรรมไม่เยอะ
              </button>
              <button
                onClick={() => handleActivitySelect("low")}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#fbb045] py-3 px-4 text-base font-semibold text-[#fff9e6] shadow-md transition hover:bg-[#fbb045]"
              >
                เล่นปกติ แต่ไม่ทั้งวัน
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------- */}
        {/* 4. หน้าจอสรุปผล (อาหาร) */}
        {/* ----------------------------------- */}
        {step === 4 && (
          <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
            <h2 className="mb-6 text-center text-2xl font-semibold text-gray-700">
              เจ้าเหมียวของคุณเหมาะกับสูตร: 
            </h2>
            {renderFoodRecommendation()}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => setStep(5)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#fbb045] py-3 px-4 text-base font-semibold text-gray-700 shadow-md transition hover:bg-[#fbb045]"
              >
                มาดูเจ้าเหมียวทดลองชิมกันเลย
              </button>
              <button
                onClick={handleReset}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 py-3 px-4 text-base font-semibold text-gray-700 shadow-md transition hover:bg-gray-200"
              >
                บันทึกผล
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------- */}
        {/* 5. หน้าจอสร้าง/แสดงวิดีโอ */}
        {/* ----------------------------------- */}
        {step === 5 && (
          <div className="rounded-2xl bg-[#eee7d3] p-6 text-center shadow-lg sm:p-8">
            <h2 className="mb-6 text-2xl font-semibold text-gray-700">
              {/* ⭐️ Change 1: เปลี่ยนหัวข้อ */}
              {generatedVideoUrl
                ? `${catName} ชิมแล้ว!`
                : `ชื่อแมว ${catName} `}
            </h2>

            {/* ⭐️ แสดงภาพการ์ตูนที่จะใช้ (เฉพาะตอนยังไม่มีวิดีโอ) */}
            {generatedImageData && !generatedVideoUrl && (
              <div className="mb-6">
                <p className="text-gray-600"></p>
                <img
                  src={generatedImageData.url}
                  alt={`Cartoon ${catName}`}
                  className="mt-4 inline-block h-64 w-64 rounded-lg object-cover shadow-md"
                />
              </div>
            )}

            {/* ⭐️ แสดงปุ่มสร้างวิดีโอ (ถ้ายังไม่มีวิดีโอ) */}
            {!generatedVideoUrl && (
              <button
                onClick={handleSubmitVideo}
                disabled={isLoadingVideo}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#fbb045] py-3 px-4 text-base font-semibold text-white shadow-md transition hover:bg-[#fbb045] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingVideo ? <Spinner /> : ""}
                {/* ⭐️ Change 2: เปลี่ยนข้อความปุ่ม */}
                {isLoadingVideo
                  ? "กำลังสร้างวิดีโอ..."
                  : "มาเริ่มสร้างวิดิโอกันเลย"}
              </button>
            )}

            {/* ⭐️ แสดงวิดีโอ (ถ้ามีวิดีโอแล้ว) */}
            {generatedVideoUrl && (
              <div className="mt-4">
                {/* ⭐️ เอา H3 Title "แอนิเมชันของ {catName}" ออกแล้ว */}
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  className="mt-4 aspect-video w-full rounded-lg shadow-md"
                >
                  เบราว์เซอร์ของคุณไม่รองรับวิดีโอ
                </video>

                {/* ⭐️ Change: กล่องข้อความแมวตอบกลับ (Sequential) */}
                <div className="flex w-full items-center justify-center mt-4 gap-2 rounded-lg bg-[#9ac93c] py-3 px-4 text-base font-semibold text-gray-800 shadow-md transition hover:bg-[#9ac93c] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  {/* Only one message appears at a time */}
                  {reactionStep === 1 && (
                    <p className="animate-bounce text-lg font-semibold text-gray-800">
                      "อร่อยมาก!"
                    </p>
                  )}
                  {reactionStep === 2 && (
                    <p className="animate-bounce text-lg font-semibold text-gray-800">
                      "ยอดไปเลย!"
                    </p>
                  )}
                  {reactionStep === 3 && (
                    <div className="animate-bounce flex items-center justify-center gap-1.5 text-xl font-bold text-gray-800">
                      <span>คะแนน 5/5</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleDownloadVideo}
                  className="flex w-full mt-2 items-center justify-center gap-2 rounded-lg bg-[#ff5555] py-3 px-4 text-base font-semibold text-white shadow-md transition hover:bg-[#ff5555] focus:outline-none focus:ring-2 focus:ring-[#ff5555] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ดาวน์โหลดวิดีโอ
                </button>
              </div>
            )}

            <button
              onClick={handleReset}
              className="flex w-full mt-2 items-center justify-center gap-2 rounded-lg bg-[#cbd183] py-3 px-4 text-base font-semibold text-gray-600 shadow-md transition hover:bg-[#cbd183] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              สร้างใหม่ทั้งหมด
            </button>
          </div>
        )}
      </main>

      {/* ----------------------------------- */}
      {/* (1.5) ส่วนแสดงผลลัพธ์ภาพ + ปุ่มไปต่อ */}
      {/* ----------------------------------- */}
      {generatedImageData && step === 1 && (
        <section className="mt-10 w-full max-w-lg text-center">
          <div className="rounded-2xl bg-[#eee7d3] p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700">
              !แปลงร่างสำเร็จแล้ว!
            </h3>
            <img
              src={generatedImageData.url}
              alt={`AI cartoon for ${catName}`}
              className="mt-4 inline-block h-64 w-64 rounded-lg object-cover shadow-md"
            />
            {/* ⭐️ ปุ่มนี้จะไป step 2 (คำถาม) */}
            <button
              onClick={() => setStep(2)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#fbb045] py-3 px-4 text-base font-semibold text-gray-700 shadow-md transition hover:bg-emerald-700"
            >
              {/* ⭐️ แก้ไขชื่อไอคอนที่นี่ */}
              สูตรอาหารที่เหมาะกับเจ้าเหมียว
              <FaHandPointLeft className="text-white" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
