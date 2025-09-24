
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
        CodeCrack
      </h1>
      <p className="mt-2 text-lg text-slate-300">
        Crack coding concepts with movies, memes & more.
      </p>
    </header>
  );
};

export default Header;
