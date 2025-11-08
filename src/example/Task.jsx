import { useState } from "react";

export default function Task() {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-slate-600 shadow-xl rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">
          สิ่งที่ต้องทำวันนี้
        </h1>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="ระบุเรื่องที่จะทำ..."
            className="flex-1 p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600" >
          </input>
          <button className="bg-red-400 text-white px-4 py-2 rounded-xl hover:bg-slate-600">
            เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
}
