import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="flex justify-between items-center px-10 py-4 bg-white shadow-sm">
      <div className="flex items-center space-x-2">
        <img
          src="/logo.png"
          alt="SkillBridge Logo"
          className="w-8 h-8"
        />
        <h1 className="text-2xl font-bold text-gray-800">
          Skill<span className="text-orange-500">Bridge</span>
        </h1>
      </div>

      <nav className="flex items-center space-x-8 text-gray-800">
        <Link to="/" className="hover:text-orange-500">Home</Link>
        <Link to="/about" className="hover:text-orange-500">About</Link>
        <Link to="/contact" className="hover:text-orange-500">Contact Us</Link>
        <Link
          to="/join"
          className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-500"
        >
          Join Now
        </Link>
      </nav>
    </header>
  );
};

export default Header;
