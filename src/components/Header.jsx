import React from 'react';

const Header = ({ title }) => {
  return (
    <header className="bg-blue-500 text-white p-4 shadow">
      <h1 className="text-xl font-bold">{title}</h1>
    </header>
  );
};

export default Header;
