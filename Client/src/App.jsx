import React from "react";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Main content goes here */}
      </main>
      <Footer />
    </div>
  );
}

export default App;