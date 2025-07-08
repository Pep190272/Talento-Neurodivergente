"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  FaHome, FaUsers, FaChartBar, FaGraduationCap, FaCog, FaChevronLeft
} from "react-icons/fa";

export default function CompanyNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedView, setSelectedView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync selected view with pathname
  useEffect(() => {
    const path = pathname.split('/').pop();
    if (path && ['analytics', 'training', 'settings', 'candidates'].includes(path)) {
      setSelectedView(path);
    } else if (pathname.includes('/company') && !pathname.includes('/candidates')) {
      setSelectedView('overview');
    }
  }, [pathname]);

  // Navigation function
  const handleNavigation = (view) => {
    if (view === 'overview') {
      setSelectedView('overview');
      router.push('/company');
    } else if (view === 'candidates') {
      router.push('/company/candidates');
    } else {
      setSelectedView(view);
      router.push(`/company/${view}`);
    }
  };

  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}>
      <button 
        className="sidebar-toggle"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        <FaChevronLeft />
      </button>
      
      <div className="sidebar-logo">
        <div className="logo-text">DiversIA</div>
      </div>
      
      <nav className="nav-menu">
        <div className="nav-item">
          <a href="#" className={`nav-link ${selectedView === 'overview' ? 'active' : ''}`} onClick={() => handleNavigation('overview')}>
            <FaHome className="nav-icon" />
            <span className="nav-text">Overview</span>
          </a>
        </div>
        <div className="nav-item">
          <a href="#" className={`nav-link ${selectedView === 'candidates' ? 'active' : ''}`} onClick={() => handleNavigation('candidates')}>
            <FaUsers className="nav-icon" />
            <span className="nav-text">Candidates</span>
          </a>
        </div>
        <div className="nav-item">
          <a href="#" className={`nav-link ${selectedView === 'analytics' ? 'active' : ''}`} onClick={() => handleNavigation('analytics')}>
            <FaChartBar className="nav-icon" />
            <span className="nav-text">Analytics</span>
          </a>
        </div>
        <div className="nav-item">
          <a href="#" className={`nav-link ${selectedView === 'training' ? 'active' : ''}`} onClick={() => handleNavigation('training')}>
            <FaGraduationCap className="nav-icon" />
            <span className="nav-text">Training</span>
          </a>
        </div>
        <div className="nav-item">
          <a href="#" className={`nav-link ${selectedView === 'settings' ? 'active' : ''}`} onClick={() => handleNavigation('settings')}>
            <FaCog className="nav-icon" />
            <span className="nav-text">Settings</span>
          </a>
        </div>
      </nav>
    </div>
  );
} 