// src/App.jsx

import { useState } from 'react';

// -----------------
// ไอคอน SVG (สำหรับปุ่ม)
// -----------------
const AiIcon = () => (
  <svg fill="currentColor" width="20" height="20" viewBox="0 0 24 24">
    <path d="M13.736 2.247a3.5 3.5 0 0 1 4.528 0 3.5 3.5 0 0 1 0 4.528L15 10l-3.736-3.736L13.736 2.247zM4.979 17.736a3.5 3.5 0 0 1 0-4.528L10 10l3.736 3.736L10.736 17a3.5 3.5 0 0 1-4.528 0L4.979 17.736zM2.247 10.736L6.264 7 10 10.736 7 14.736 2.247 10.736zM17 10l3.736-3.736 1.017 1.017a3.5 3.5 0 0 1 0 4.528L18.264 15 15 11.736 17 10z" />
  </svg>
);
const VideoIcon = () => (
  <svg fill="currentColor" width="20" height="20" viewBox="0 0 24 24">
    <path d="M17 10.5V7c0-1.66-1.34-3-3-3H7c-1.66 0-3 1.34-3 3v10c0 1.66 1.34 3 3 3h7c1.66 0 3-1.34 3-3v-3.5l4 4v-11l-4 4z" />
  </svg>
);

// Component สำหรับแสดงสถานะ Loading
const Spinner = () => (
  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
);

// -----------------
// URL ของ Backend (Laravel API)
// -----------------
const API_BASE_URL = 'https://dev.dpujam.com/api'; // ⭐️ ตรวจสอบว่านี่คือ URL ที่ถูกต้อง
const LEONARDO_API_KEY = '0f0cc4b4-785a-4823-9c59-8c489c86ec05'; // ⭐️ ดึง Key จาก .env
const LEONARDO_BASE_URL = 'https://cloud.leonardo.ai/api/rest/v1';


export default function App() {

  // -----------------
  // State ทั้งหมดของแอป
  // -----------------
  const [step, setStep] = useState(1); // 1 = สร้างภาพ, 2 = สร้างวิดีโอ, 3 = แสดงวิดีโอ
  const [catName, setCatName] = useState('');
  const [originalImageFile, setOriginalImageFile] = useState(null);
  const [originalImagePreview, setOriginalImagePreview] = useState('');
  
  // State สำหรับผลลัพธ์
  const [generatedImageData, setGeneratedImageData] = useState(null); // { id: '...', url: '...' }
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');

  // State สำหรับการโหลด
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  // -----------------
  // ฟังก์ชันจัดการ
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
    if (!LEONARDO_API_KEY) {
    alert('VITE_LEONARDO_API_KEY is not set. Please check your .env.local file.');
    return;
    }
    setIsLoadingImage(true);
    setGeneratedImageData(null);
    setGeneratedVideoUrl(''); // ล้างวิดีโอเก่า (ถ้ามี)

    // 1. สร้าง FormData เพื่อส่งไฟล์และข้อความ
    const formData = new FormData();
    formData.append('catName', catName);
    formData.append('imageFile', originalImageFile); // 'imageFile' ต้องตรงกับที่ Laravel รับ

    try {
      // 2. เรียก Backend (Laravel)
      const response = await fetch(`${API_BASE_URL}/imagen`, {
        method: 'POST',
        body: formData,
        // headers: { 'Accept': 'application/json' } // FormData ไม่ต้องตั้ง Content-Type
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
      }

      // 3. เก็บผลลัพธ์ { id, url }
      setGeneratedImageData(result);
      
    } catch (error) {
      console.error(error);
      alert(`เกิดข้อผิดพลาดในการสร้างภาพ: ${error.message}`);
    } finally {
      setIsLoadingImage(false);
    }
  };

  // ⭐️ เมื่อกด "สร้างวิดีโอ" (ขั้นตอนที่ 2)
  const handleSubmitVideo = async () => {
    if (!generatedImageData || !generatedImageData.id) {
      alert('เกิดข้อผิดพลาด: ไม่พบ ID รูปภาพที่สร้าง');
      return;
    }

    setIsLoadingVideo(true);
    setGeneratedVideoUrl('');

    try {
      // 1. เรียก Backend (Laravel) - Endpoint ใหม่
      const response = await fetch(`${API_BASE_URL}/imagen-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // 2. ส่ง ID ของภาพการ์ตูนไปเป็น JSON
        body: JSON.stringify({
          imageId: generatedImageData.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
      }

      // 3. รับ URL วิดีโอ
      setGeneratedVideoUrl(result.url);
      setStep(3); // ไปขั้นตอนที่ 3 (แสดงผลวิดีโอ)

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
  };
  
  // -----------------
  // UI การแสดงผล
  // -----------------
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-purple-50 py-12 px-4">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">Cat-Toon Studio 🐱</h1>
        <p className="mt-2 text-lg text-gray-600">
          เปลี่ยนน้องแมวของคุณให้เป็นการ์ตูนและแอนิเมชัน
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
              ขั้นตอนที่ 1: สร้างภาพการ์ตูน
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
                required={!originalImageFile} // ต้องใส่ถ้ายังไม่เคยเลือก
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
              {isLoadingImage ? <Spinner /> : <AiIcon />}
              {isLoadingImage ? 'กำลังสร้างภาพ...' : 'สร้างภาพแมว (ขั้นตอนที่ 1)'}
            </button>
          </form>
        )}

        {/* ----------------------------------- */}
        {/* 2. หน้าจอสร้างวิดีโอ (Video Gen) */}
        {/* ----------------------------------- */}
        {(step === 2 || step === 3) && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-lg sm:p-8">
            <h2 className="mb-6 text-2xl font-semibold text-gray-700">
              {step === 2 ? 'ขั้นตอนที่ 2: สร้างแอนิเมชัน' : 'แอนิเมชันเสร็จแล้ว!'}
            </h2>
            
            {/* แสดงภาพการ์ตูนที่สร้างเสร็จ */}
            {generatedImageData && (
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

            {/* ปุ่มสร้างวิดีโอ (แสดงเฉพาะ step 2) */}
            {step === 2 && (
              <button
                onClick={handleSubmitVideo}
                disabled={isLoadingVideo}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 px-4 text-base font-semibold text-white shadow-md transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingVideo ? <Spinner /> : <VideoIcon />}
                {isLoadingVideo ? 'กำลังสร้างวิดีโอ...' : 'สร้าง video แมว (ขั้นตอนที่ 2)'}
              </button>
            )}

            {/* ----------------------------------- */}
            {/* 3. หน้าจอแสดงผลวิดีโอ (Result) */}
            {/* ----------------------------------- */}
            {step === 3 && generatedVideoUrl && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-gray-700">
                  แอนิเมชันของ {catName}
                </h3>
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  className="mt-4 aspect-video w-full rounded-lg shadow-md"
                >
                  เบราว์เซอร์ของคุณไม่รองรับวิดีโอ
                </video>
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
            <button
              onClick={() => setStep(2)} 
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 px-4 text-base font-semibold text-white shadow-md transition hover:bg-emerald-700"
            >
              <VideoIcon />
              ไปขั้นตอนที่ 2 (สร้างวิดีโอ)
            </button>
          </div>
        </section>
      )}
    </div>
  );
}