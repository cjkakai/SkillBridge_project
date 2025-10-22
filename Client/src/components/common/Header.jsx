import React from "react";

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
        <a href="/" className="hover:text-orange-500">Home</a>
        <a href="/about" className="hover:text-orange-500">About</a>
        <a href="/contact" className="hover:text-orange-500">Contact Us</a>
        <a
          href="/join"
          className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-500"
        >
          Join Now
        </a>
      </nav>
    </header>
  );
};

export default Header;
