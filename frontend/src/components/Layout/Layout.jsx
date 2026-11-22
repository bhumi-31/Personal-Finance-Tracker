import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="layout">
      <Header />
      <div className="layout-body">
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
