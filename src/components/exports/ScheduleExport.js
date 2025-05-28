import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportToCsv = (scheduleData, selectedWeek, days, timeSlots) => {
  let csvContent = "Zeit;";
  days.forEach(day => csvContent += `${day};`);
  csvContent += "\n";
  
  timeSlots.forEach(time => {
    csvContent += `${time};`;
    days.forEach(day => {
      if (scheduleData[selectedWeek]?.[day]?.[time]) {
        const shifts = scheduleData[selectedWeek][day][time];
        const cellContent = shifts.map(shift => 
          `${shift.name} (${shift.task})${shift.notes ? ` - ${shift.notes}` : ''}`
        ).join(" / ");
        csvContent += `"${cellContent}";`;
      } else {
        csvContent += ";";
      }
    });
    csvContent += "\n";
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Dienstplan_${selectedWeek.replace(/\s/g, '_')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPdf = (scheduleData, selectedWeek, days, timeSlots) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  doc.setFontSize(16);
  doc.text(`Dienstplan ${selectedWeek}`, 14, 15);
  
  const tableHeaders = ['Zeit', ...days];
  const tableData = timeSlots.map(time => {
    const row = [time];
    days.forEach(day => {
      if (scheduleData[selectedWeek]?.[day]?.[time]) {
        const shifts = scheduleData[selectedWeek][day][time];
        const cellContent = shifts.map(shift => 
          `${shift.name} (${shift.task})${shift.notes ? `\n↪ ${shift.notes}` : ''}`
        ).join("\n");
        row.push(cellContent);
      } else {
        row.push('');
      }
    });
    return row;
  });
  
  doc.autoTable({
    head: [tableHeaders],
    body: tableData,
    startY: 20,
    styles: { 
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    headStyles: { 
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: { 
      0: { cellWidth: 15 }
    },
    alternateRowStyles: { 
      fillColor: [245, 245, 245]
    },
    theme: 'grid',
    margin: { top: 20, right: 14, bottom: 20, left: 14 },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index > 0) {
        const text = data.cell.text.join('');
        if (text.includes('Frühdienst')) {
          data.cell.styles.fillColor = [219, 234, 254];
        } else if (text.includes('Tagesdienst')) {
          data.cell.styles.fillColor = [220, 252, 231];
        } else if (text.includes('Spätdienst')) {
          data.cell.styles.fillColor = [243, 232, 255];
        } else if (text.includes('Nachtdienst')) {
          data.cell.styles.fillColor = [229, 231, 235];
        } else if (text.includes('Kochen')) {
          data.cell.styles.fillColor = [254, 226, 226];
        } else if (text.includes('Wochenende')) {
          data.cell.styles.fillColor = [254, 249, 195];
        }
      }
    }
  });
  
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const today = new Date().toLocaleDateString('de-DE');
    doc.setFontSize(8);
    doc.text(`Erstellt am: ${today} | Seite ${i} von ${pageCount}`, 14, doc.internal.pageSize.height - 10);
  }
  
  doc.save(`Dienstplan_${selectedWeek.replace(/\s/g, '_')}.pdf`);
}; 