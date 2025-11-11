import { useState, useEffect } from 'react';
// ⭐️ import ไอคอนมาให้ครบ (แก้ไขชื่อไอคอนที่ผิด)
import { Camera, Heart, Video, MessageCircleQuestion, Save, Star } from "lucide-react";

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
const API_BASE_URL = 'https://dev.dpujam.com/api'; // ⭐️ ตรวจสอบว่านี่คือ URL ที่ถูกต้อง

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
  const [catName, setCatName] = useState('');
  const [originalImageFile, setOriginalImageFile] = useState(null);
  const [originalImagePreview, setOriginalImagePreview] = useState('');

  // State สำหรับผลลัพธ์
  const [generatedImageData, setGeneratedImageData] = useState(null); // { id: '...', url: '...' }
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');

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

  // เมื่อเลือกไฟล์
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalImageFile(file);
      setOriginalImagePreview(URL.createObjectURL(file));
      // รีเซ็ตค่าเมื่อเลือกรูปใหม่
      setGeneratedImageData(null);
      setGeneratedVideoUrl('');
      setStep(1);
    }
  };

  // ⭐️ เมื่อกด "สร้างภาพแมว" (ขั้นตอนที่ 1)
  const handleSubmitImage = async (e) => {
    e.preventDefault();
    if (!originalImageFile || !catName) {
      alert('กรุณาใส่ชื่อและอัปโหลดรูปก่อนครับ');
      return;
    }
    setIsLoadingImage(true);
    setGeneratedImageData(null);
    setGeneratedVideoUrl('');

    const formData = new FormData();
    formData.append('catName', catName);
    formData.append('imageFile', originalImageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/imagen`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
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
    if (age === '<1') {
      // แมวเด็ก ไปหน้าสรุปผลเลย
      setRecommendedFood('kitten');
      setStep(4);
    } else {
      // แมวโต ไปคำถาม 2
      setStep(3);
    }
  };

  // ⭐️ ฟังก์ชันใหม่: เมื่อเลือกกิจกรรม (คำถาม 2)
  const handleActivitySelect = (level) => {
    setActivityLevel(level);
    if (level === 'high') {
      setRecommendedFood('active');
    } else {
      setRecommendedFood('indoor');
    }
    setStep(4); // ไปหน้าสรุปผล
  };

  // ⭐️ เมื่อกด "สร้างวิดีโอ" (ย้ายไปขั้นตอนที่ 5)
  const handleSubmitVideo = async () => {
    if (!generatedImageData || !generatedImageData.id) {
      alert('เกิดข้อผิดพลาด: ไม่พบ ID รูปภาพที่สร้าง');
      return;
    }

    setIsLoadingVideo(true);
    setGeneratedVideoUrl('');

    try {
      const response = await fetch(`${API_BASE_URL}/imagen-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          imageId: generatedImageData.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
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
    setCatName('');
    setOriginalImageFile(null);
    setOriginalImagePreview('');
    setGeneratedImageData(null);
    setGeneratedVideoUrl('');
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
      title: '',
      imageUrl: '',
      description: ''
    };

    switch (recommendedFood) {
      case 'kitten':
        foodData = {
          title: 'อาหารแมวเด็ก (Kitten Formula)',
          imageUrl: './01.jpg',
          description: 'สูตรสำหรับลูกแมวโดยเฉพาะ ให้พลังงานสูงและสารอาหารครบถ้วน'
        };
        break;
      case 'active':
        foodData = {
          title: 'สูตรแมวแอคทีฟ (Active Cat)',
          imageUrl: './02.jpg',
          description: 'สำหรับแมวพลังงานสูง ชอบวิ่งเล่น ต้องการโปรตีนเพื่อเสริมสร้างกล้ามเนื้อ'
        };
        break;
      case 'indoor':
        foodData = {
          title: 'สูตรแมวเลี้ยงในบ้าน (Indoor Cat)',
          imageUrl: './03.jpg',
          description: 'สำหรับแมวที่ไม่ค่อยได้ทำกิจกรรม ช่วยควบคุมพลังงานและดูแลรูปร่าง'
        };
        break;
      default:
        return <p>ไม่พบข้อมูลอาหารที่แนะนำ</p>;
    }

    return (
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-700">{foodData.title}</h3>
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
      case 'kitten':
        return 'อาหารแมวเด็ก';
      case 'active':
        return 'สูตร Active Cat';
      case 'indoor':
        return 'สูตร Indoor Cat';
      default:
        return 'อาหารแมว';
    }
  };


  // -----------------
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-purple-50 py-12 px-4">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">Pawdy AI</h1>
        <p className="mt-2 text-lg text-gray-600">
          เปลี่ยนน้องแมวของคุณให้เป็นการ์ตูนและแอนิเมชันสุดน่ารัก
        </p>
      </header>

      {/* ----------------------------------- */}
      {/* 1. หน้าจอสร้างภาพ (Image Gen) */}
      {/* ----------------------------------- */}
      <main className="mt-8 w-full max-w-lg">
        {step === 1 && (
          <form
            onSubmit={handleSubmitImage}
            className="rounded-2xl bg-white p-6 shadow-lg sm:p-8"
          >
            <h2 className="mb-6 text-2xl font-semibold text-gray-700">
              ขั้นตอนที่ 1: ข้อมูลน้องแมวของคุณ
            </h2>

            {/* ชื่อแมว */}
            <div className="mb-6">
              <label htmlFor="catName" className="mb-2 block text-sm font-medium text-gray-700">
                ชื่อน้องแมว
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
              <label htmlFor="catImage" className="mb-2 block text-sm font-medium text-gray-700">
                อัปโหลดรูปน้องแมว
              </label>
              <input
                type="file"
                id="catImage"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-900 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-200 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-300"
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
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 px-4 text-base font-semibold text-white shadow-md transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingImage ? <Spinner /> : <Heart />}
              {isLoadingImage ? 'กำลังสร้างภาพ...' : 'สร้างภาพแมว (ขั้นตอนที่ 1)'}
            </button>
          </form>
        )}

        {/* ----------------------------------- */}
        {/* 2. หน้าจอคำถาม 1 (อายุ) */}
        {/* ----------------------------------- */}
        {step === 2 && (
          <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
            <h2 className="mb-6 text-center text-2xl font-semibold text-gray-700">
              ขั้นตอนที่ 2: คำถามข้อที่ 1
            </h2>
            <p className="mb-6 text-center text-lg text-gray-600">
              อายุของน้องแมว
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleAgeSelect('<1')}
                className="w-full rounded-lg bg-violet-100 py-3 px-4 text-base font-semibold text-violet-700 transition hover:bg-violet-200"
              >
                ต่ำกว่า 1 ปี (แมวเด็ก)
              </button>
              <button
                onClick={() => handleAgeSelect('>=1')}
                className="w-full rounded-lg bg-violet-100 py-3 px-4 text-base font-semibold text-violet-700 transition hover:bg-violet-200"
              >
                1 ปีขึ้นไป (แมวโต)
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------- */}
        {/* 3. หน้าจอคำถาม 2 (กิจกรรม) */}
        {/* ----------------------------------- */}
        {step === 3 && (
          <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
            <h2 className="mb-6 text-center text-2xl font-semibold text-gray-700">
              ขั้นตอนที่ 3: คำถามข้อที่ 2
            </h2>
            <p className="mb-6 text-center text-lg text-gray-600">
              พฤติกรรมการใช้พลังงานของน้องแมว
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleActivitySelect('high')}
                className="w-full rounded-lg bg-violet-100 py-3 px-4 text-base font-semibold text-violet-700 transition hover:bg-violet-200"
              >
                ชอบวิ่งเล่น อยู่ไม่ค่อยนิ่ง
              </button>
              <button
                onClick={() => handleActivitySelect('high')}
                className="w-full rounded-lg bg-violet-100 py-3 px-4 text-base font-semibold text-violet-700 transition hover:bg-violet-200"
              >
                พลังงานเยอะ
              </button>
              <button
                onClick={() => handleActivitySelect('low')}
                className="w-full rounded-lg bg-violet-100 py-3 px-4 text-base font-semibold text-violet-700 transition hover:bg-violet-200"
              >
                ชอบนอน ทำกิจกรรมไม่เยอะ
              </button>
              <button
                onClick={() => handleActivitySelect('low')}
                className="w-full rounded-lg bg-violet-100 py-3 px-4 text-base font-semibold text-violet-700 transition hover:bg-violet-200"
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
              ผลลัพธ์: สูตรอาหารที่แนะนำ
            </h2>
            {renderFoodRecommendation()}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => setStep(5)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 px-4 text-base font-semibold text-white shadow-md transition hover:bg-emerald-700"
              >
                <Video />
                ทดลองชิม
              </button>
              <button
                onClick={handleReset}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-600 py-3 px-4 text-base font-semibold text-white shadow-md transition hover:bg-gray-700"
              >
                <Save />
                บันทึกผล
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------- */}
        {/* 5. หน้าจอสร้าง/แสดงวิดีโอ */}
        {/* ----------------------------------- */}
        {step === 5 && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-lg sm:p-8">
            <h2 className="mb-6 text-2xl font-semibold text-gray-700">
              {/* ⭐️ Change 1: เปลี่ยนหัวข้อ */}
              {generatedVideoUrl
                ? `${catName} ชิมแล้ว!`
                : `${catName} กำลังชิม ${getFoodDisplayName(recommendedFood)}`}
            </h2>

            {/* ⭐️ แสดงภาพการ์ตูนที่จะใช้ (เฉพาะตอนยังไม่มีวิดีโอ) */}
            {generatedImageData && !generatedVideoUrl && (
              <div className="mb-6">
                <p className="text-gray-600">
                  ภาพการ์ตูนของ {catName} ที่จะใช้:
                </p>
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
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 px-4 text-base font-semibold text-white shadow-md transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingVideo ? <Spinner /> : <Video />}
                {/* ⭐️ Change 2: เปลี่ยนข้อความปุ่ม */}
                {isLoadingVideo ? 'กำลังสร้างวิดีโอ...' : 'ปุ่มทดลองชิม'}
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
                <div className="mt-6 flex min-h-[120px] items-center justify-center rounded-lg border-2 border-pink-300 bg-pink-50 p-4 text-center shadow-md">
                  {/* Only one message appears at a time */}
                  {reactionStep === 1 && (
                    <p className="animate-bounce text-lg font-semibold text-pink-700">"อร่อยมาก!"</p>
                  )}
                  {reactionStep === 2 && (
                    <p className="animate-bounce text-lg font-semibold text-pink-700">"ยอดไปเลย!"</p>
                  )}
                  {reactionStep === 3 && (
                    <div className="animate-bounce flex items-center justify-center gap-1.5 text-xl font-bold text-yellow-500">
                      <span>คะแนน 5/5</span>
                      <Star className="h-5 w-5 fill-yellow-500" />
                    </div>
                  )}
                </div>
                
              </div>
            )}

            <button
              onClick={handleReset}
              className="mt-6 w-full text-sm font-semibold text-gray-500 hover:text-gray-700 hover:underline"
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
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700">
              ภาพการ์ตูนของ {catName} เสร็จแล้ว!
            </h3>
            <img
              src={generatedImageData.url}
              alt={`AI cartoon for ${catName}`}
              className="mt-4 inline-block h-64 w-64 rounded-lg object-cover shadow-md"
            />
            {/* ⭐️ ปุ่มนี้จะไป step 2 (คำถาม) */}
            <button
              onClick={() => setStep(2)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 px-4 text-base font-semibold text-white shadow-md transition hover:bg-emerald-700"
            >
              {/* ⭐️ แก้ไขชื่อไอคอนที่นี่ */}
              <MessageCircleQuestion />
              ไปขั้นตอนที่ 2 ตอบคำถาม
            </button>
          </div>
        </section>
      )}
    </div>
  );
}