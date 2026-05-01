import { useEffect, useState } from 'react';
import LabsDashboard from './LabsDashboard';
import LabScanner from './LabScanner';
import LabHistory from './LabHistory';
import LabReportView from './LabReportView';
import LabEducation from './LabEducation';

export default function LabsRouter() {
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      // Parse hash for labs routes
      if (hash.startsWith('#/labs/')) {
        const path = hash.replace('#/labs/', '');
        
        if (path.startsWith('report/')) {
          setReportId(path.replace('report/', ''));
          setCurrentRoute('report');
        } else {
          setCurrentRoute(path || 'dashboard');
        }
      } else if (hash === '#/labs') {
        setCurrentRoute('dashboard');
      }
    };

    // Initial load
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  switch (currentRoute) {
    case 'scan':
      return <LabScanner />;
    case 'history':
      return <LabHistory />;
    case 'report':
      return <LabReportView />;
    case 'education':
      return <LabEducation />;
    case 'dashboard':
    default:
      return <LabsDashboard />;
  }
}

