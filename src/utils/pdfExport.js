import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDF_STYLES } from '../constants';

const getShiftColor = (text) => {
  if (text.includes('Frühdienst')) return PDF_STYLES.COLORS.SHIFT_COLORS.EARLY;
  if (text.includes('Tagesdienst')) return PDF_STYLES.COLORS.SHIFT_COLORS.DAY;
  if (text.includes('Spätdienst')) return PDF_STYLES.COLORS.SHIFT_COLORS.LATE;
  if (text.includes('Nachtdienst')) return PDF_STYLES.COLORS.SHIFT_COLORS.NIGHT;
  if (text.includes('Kochen')) return PDF_STYLES.COLORS.SHIFT_COLORS.COOKING;
  if (text.includes('Wochenende')) return PDF_STYLES.COLORS.SHIFT_COLORS.WEEKEND;
  return null;
};

const formatShiftContent = (shifts) => {
  return shifts.map(shift => 
    `${shift.name} (${shift.task})${shift.notes ? `\n↪ ${shift.notes}` : ''}`
  ).join("\n");
};

export const exportScheduleAsPDF = ({
  selectedDay,
  selectedWeek,
  days,
  timeSlots,
  scheduleData,
  formatWeekDayDate
}) => {
  const doc = new jsPDF({
    orientation: selectedDay ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  // Titel
  doc.setFontSize(PDF_STYLES.FONT_SIZES.TITLE);
  const title = selectedDay 
    ? `Dienstplan ${selectedDay} ${formatWeekDayDate(selectedWeek, selectedDay)}` 
    : `Dienstplan ${selectedWeek}`;
  doc.text(title, 14, 15);
  
  // Tabellendaten vorbereiten
  const tableHeaders = ['Zeit', ...(selectedDay ? [selectedDay] : days)];
  const tableData = timeSlots.map(time => {
    const row = [time];
    const daysToProcess = selectedDay ? [selectedDay] : days;
    
    daysToProcess.forEach(day => {
      if (scheduleData[selectedWeek]?.[day]?.[time]) {
        const shifts = scheduleData[selectedWeek][day][time];
        row.push(formatShiftContent(shifts));
      } else {
        row.push('');
      }
    });
    return row;
  });
  
  // Tabelle erstellen
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 20,
    styles: { 
      fontSize: PDF_STYLES.FONT_SIZES.NORMAL,
      cellPadding: PDF_STYLES.CELL_STYLES.PADDING,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    headStyles: { 
      fillColor: PDF_STYLES.COLORS.BLUE,
      textColor: PDF_STYLES.COLORS.WHITE,
      fontStyle: 'bold'
    },
    columnStyles: { 
      0: { 
        cellWidth: selectedDay 
          ? PDF_STYLES.CELL_STYLES.FIRST_COLUMN_WIDTH.DAY_VIEW 
          : PDF_STYLES.CELL_STYLES.FIRST_COLUMN_WIDTH.WEEK_VIEW 
      }
    },
    alternateRowStyles: { 
      fillColor: PDF_STYLES.COLORS.GRAY
    },
    theme: 'grid',
    margin: PDF_STYLES.MARGINS,
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index > 0) {
        const text = data.cell.text.join('');
        const color = getShiftColor(text);
        if (color) {
          data.cell.styles.fillColor = color;
        }
      }
    }
  });
  
  // Fußzeile
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const today = new Date().toLocaleDateString('de-DE');
    doc.setFontSize(PDF_STYLES.FONT_SIZES.FOOTER);
    doc.text(
      `Erstellt am: ${today} | Seite ${i} von ${pageCount}`, 
      14, 
      doc.internal.pageSize.height - 10
    );
  }
  
  // PDF speichern
  const filename = selectedDay 
    ? `Dienstplan_${selectedDay}_${formatWeekDayDate(selectedWeek, selectedDay).replace(/\./g, '-')}.pdf`
    : `Dienstplan_${selectedWeek.replace(/\s/g, '_')}.pdf`;
  doc.save(filename);
}; 