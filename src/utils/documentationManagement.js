export const addDocumentationToShift = ({
  selectedChild,
  documentation,
  currentUser,
  currentShift,
  scheduleData,
  selectedWeek,
  modalData
}) => {
  if (!selectedChild || !documentation.trim()) {
    throw new Error('Kind und Dokumentation müssen angegeben werden');
  }

  const newDoc = {
    id: Date.now().toString(),
    childId: parseInt(selectedChild),
    text: documentation,
    timestamp: new Date().toISOString(),
    employeeId: currentUser.id
  };

  const newData = { ...scheduleData };
  const weekKey = selectedWeek;
  const day = modalData.day;
  const time = modalData.time;

  if (!newData[weekKey]) newData[weekKey] = {};
  if (!newData[weekKey][day]) newData[weekKey][day] = {};
  if (!newData[weekKey][day][time]) newData[weekKey][day][time] = [];

  const shiftIndex = newData[weekKey][day][time].findIndex(s => s.id === currentShift.id);

  if (shiftIndex >= 0) {
    const updatedShift = {
      ...newData[weekKey][day][time][shiftIndex],
      documentations: [
        ...(newData[weekKey][day][time][shiftIndex].documentations || []),
        newDoc
      ]
    };
    newData[weekKey][day][time][shiftIndex] = updatedShift;
    return { updatedScheduleData: newData, updatedShift };
  }

  throw new Error('Schicht konnte nicht gefunden werden');
};

export const updateDocumentationInShift = ({
  editingDocId,
  editingDocText,
  selectedChild,
  currentShift,
  scheduleData,
  selectedWeek,
  modalData
}) => {
  if (!editingDocText.trim() || !selectedChild) {
    throw new Error('Kind und Dokumentation müssen angegeben werden');
  }

  const newData = { ...scheduleData };
  const weekKey = selectedWeek;
  const day = modalData.day;
  const time = modalData.time;
  
  const shiftIndex = newData[weekKey][day][time].findIndex(s => s.id === currentShift.id);
  
  if (shiftIndex >= 0) {
    const updatedDocs = currentShift.documentations.map(doc => 
      doc.id === editingDocId
        ? { 
            ...doc, 
            text: editingDocText, 
            childId: parseInt(selectedChild),
            lastModified: new Date().toISOString()
          }
        : doc
    );
    
    const updatedShift = {
      ...currentShift,
      documentations: updatedDocs
    };
    
    newData[weekKey][day][time][shiftIndex] = updatedShift;
    return { updatedScheduleData: newData, updatedShift };
  }

  throw new Error('Schicht konnte nicht gefunden werden');
};

export const deleteDocumentationFromShift = ({
  docId,
  currentShift,
  scheduleData,
  selectedWeek,
  modalData
}) => {
  const updatedDocs = currentShift.documentations.filter(doc => doc.id !== docId);
  const updatedShift = {
    ...currentShift,
    documentations: updatedDocs
  };

  const newData = { ...scheduleData };
  const weekKey = selectedWeek;
  const day = modalData.day;
  const time = modalData.time;
  
  const shiftIndex = newData[weekKey][day][time].findIndex(s => s.id === currentShift.id);
  
  if (shiftIndex >= 0) {
    newData[weekKey][day][time][shiftIndex] = updatedShift;
    return { updatedScheduleData: newData, updatedShift };
  }

  throw new Error('Schicht konnte nicht gefunden werden');
}; 