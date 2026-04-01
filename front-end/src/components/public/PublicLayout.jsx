import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import '../../styles/public.css';

function PublicLayout() {
  return (
    <div className="public-layout">
      <PublicNavbar />
      <div className="public-page-wrapper">
        <Outlet />
      </div>
      <PublicFooter />
    </div>
  );
}

export default PublicLayout;
