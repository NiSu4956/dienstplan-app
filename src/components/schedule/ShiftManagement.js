import React from 'react';
import { 
  handleShiftSave as handleShiftSaveUtil,
  updateScheduleWithNewShift,
  deleteShiftFromSchedule,
  validateShiftAssignment
} from '../../utils/shiftManagement';

const ShiftManagement = ({
  scheduleData,
  setScheduleData,
  employees,
  shiftTypes,
  onShiftSave,
  onShiftDelete
}) => {
  const handleSaveShift = async (shiftData) => {
    try {
      const validationResult = validateShiftAssignment(shiftData, scheduleData, employees);
      if (!validationResult.isValid) {
        throw new Error(validationResult.message);
      }

      const updatedSchedule = await handleShiftSaveUtil(shiftData, scheduleData);
      setScheduleData(updatedSchedule);
      onShiftSave(shiftData);
    } catch (error) {
      console.error('Error saving shift:', error);
      throw error;
    }
  };

  const handleDeleteShift = async (day, time, shiftId) => {
    try {
      const updatedSchedule = deleteShiftFromSchedule(shiftId, scheduleData);
      setScheduleData(updatedSchedule);
      onShiftDelete(shiftId);
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw error;
    }
  };

  return {
    handleSaveShift,
    handleDeleteShift
  };
};

export default ShiftManagement; 