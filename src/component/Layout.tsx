import React from 'react';
import Footer from './Footer';
import Header from './Header';
import LogBar from './LogBar';

function Layout({ children }) {
  return (
    <>
      <Header />
      <main>
        {children}
        <LogBar />
      </main>
      <Footer />
    </>
  );
}

export default Layout;
