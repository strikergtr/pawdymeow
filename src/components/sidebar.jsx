import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h1 className="text-xl font-bold mb-6">My App</h1>
      <nav className="flex flex-col space-y-3">
        <Link to="/" className="hover:bg-gray-700 p-2 rounded">Home</Link>
      </nav>
    </div>
  );
}