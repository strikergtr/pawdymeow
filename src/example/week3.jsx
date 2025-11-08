import React, { useState } from "react";

export default function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (task.trim() === "") return;
    setTasks([...tasks, { text: task, done: false }]);
    setTask("");
  };

  const toggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);
  };
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">
          สิ่งที่ต้องทำวันนี้
        </h1>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="ระบุเรื่องที่จะทำ..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="flex-1 p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
            onClick={addTask}
          >
            เพิ่ม
          </button>
        </div>

        <ul className="space-y-2">
          {tasks.map((t, index) => (
            <li
              key={index}
              className="flex items-center justify-between bg-gray-50 p-2 rounded-xl shadow-sm" >
              <span
                onClick={() => toggleTask(index)}
                className={`cursor-pointer flex-1 ${
                  t.done ? "line-through text-gray-400" : "" }`} >
                {t.text}
              </span>
              <button
                onClick={() => toggleTask(index)}
                className={`px-3 py-1 text-sm rounded-xl ${
                  t.done ? "bg-green-400 text-white" : "bg-gray-200" }`} >
                {t.done ? "Done" : "Mark"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}