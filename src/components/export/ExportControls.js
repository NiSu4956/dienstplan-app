import React from 'react';
import { exportScheduleAsPDF } from '../../utils/pdfExport';

const ExportControls = ({
  scheduleData,
  currentWeek,
  currentYear,
  onExport
}) => {
  const handleExport = () => {
    try {
      const exportData = {
        schedule: scheduleData,
        week: currentWeek,
        year: currentYear
      };
      onExport(exportData);
    } catch (error) {
      console.error('Error exporting schedule:', error);
      throw error;
    }
  };

  const handlePdfExport = async () => {
    try {
      await exportScheduleAsPDF(scheduleData, currentWeek, currentYear);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  };

  return {
    handleExport,
    handlePdfExport
  };
};

export default ExportControls; 