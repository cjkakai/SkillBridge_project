import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-10 text-center">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} SkillBridge. All Rights Reserved.</p>
        <div className="mt-2 flex justify-center space-x-6 text-sm">
          <a href="/privacy" className="hover:text-white">Privacy Policy</a>
          <a href="/terms" className="hover:text-white">Terms of Service</a>
          <a href="/contact" className="hover:text-white">Contact Us</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
