"use client";
import React from "react";
import CompanyNavigation from "./CompanyNavigation";
import "../company.css";

export default function CompanyPageLayout({ children }) {
  return (
    <div className="company-dashboard-area">
      <div className="dashboard-container">
        <CompanyNavigation />
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
} 