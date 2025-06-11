import React from 'react';
import {
  addDocumentationToShift,
  updateDocumentationInShift,
  deleteDocumentationFromShift
} from '../../utils/documentationManagement';

const DocumentationManagement = ({
  scheduleData,
  setScheduleData,
  onDocumentationSave,
  onDocumentationUpdate,
  onDocumentationDelete
}) => {
  const handleSaveDocumentation = async (shiftId, documentationData) => {
    try {
      const updatedSchedule = await addDocumentationToShift(shiftId, documentationData, scheduleData);
      setScheduleData(updatedSchedule);
      onDocumentationSave(shiftId, documentationData);
    } catch (error) {
      console.error('Error saving documentation:', error);
      throw error;
    }
  };

  const handleUpdateDocumentation = async (shiftId, docId, updatedData) => {
    try {
      const updatedSchedule = await updateDocumentationInShift(shiftId, docId, updatedData, scheduleData);
      setScheduleData(updatedSchedule);
      onDocumentationUpdate(shiftId, docId, updatedData);
    } catch (error) {
      console.error('Error updating documentation:', error);
      throw error;
    }
  };

  const handleDeleteDocumentation = async (shiftId, docId) => {
    try {
      const updatedSchedule = await deleteDocumentationFromShift(shiftId, docId, scheduleData);
      setScheduleData(updatedSchedule);
      onDocumentationDelete(shiftId, docId);
    } catch (error) {
      console.error('Error deleting documentation:', error);
      throw error;
    }
  };

  return {
    handleSaveDocumentation,
    handleUpdateDocumentation,
    handleDeleteDocumentation
  };
};

export default DocumentationManagement; 