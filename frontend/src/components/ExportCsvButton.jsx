import React from 'react';
import { exportToCsv } from '../services/api';

export default function ExportCsvButton({ filename = 'report', headers = [], data = [] }) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }
    exportToCsv(filename, headers, data);
  };

  return (
    <button type="button" className="btn btn-secondary btn-sm" onClick={handleExport}>
      📥 Export CSV
    </button>
  );
}
