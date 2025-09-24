import React from "react";
import GoogleAd from "./GoogleAd";

const AdBanner: React.FC = () => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 text-center h-full flex flex-col justify-between shadow-lg">
      <div>
        <h3 className="font-bold text-lg text-slate-300">SPONSORED</h3>
        <div className="mt-4">
          <GoogleAd />
        </div>
        <p className="text-sm text-slate-400 mt-4">
          Your ad here! Reach thousands of developers learning new concepts
          every day.
        </p>
      </div>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="mt-6 block w-full bg-sky-600 text-white font-semibold py-2 px-4 rounded hover:bg-sky-500 transition-colors duration-200"
      >
        Learn More
      </a>
    </div>
  );
};

export default AdBanner;
