import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Payment & License Delivery System</Link>
      </div>
    </header>
  );
}

export default Header;
