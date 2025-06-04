export const DAYS_OF_WEEK = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

export const TIME_SLOTS = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
                     '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

export const STORAGE_KEYS = {
  USER: 'currentUser',
  SCHEDULE_DATA: 'scheduleData',
  CHILDREN: 'children'
};

export const ROLES = {
  ADMIN: 'admin'
};

export const REQUEST_TYPES = {
  VACATION: 'vacation',
  SICK: 'sick'
};

export const DEFAULT_TIME_SLOT = '07:00';

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const REQUEST_STATUS_TEXT = {
  pending: 'Ausstehend',
  approved: 'Genehmigt',
  rejected: 'Abgelehnt'
};

export const REQUEST_STATUS_CLASS = {
  pending: 'status-pending',
  approved: 'status-approved',
  rejected: 'status-rejected'
};

export const PDF_STYLES = {
  FONT_SIZES: {
    TITLE: 16,
    NORMAL: 8,
    FOOTER: 8
  },
  COLORS: {
    BLUE: [79, 70, 229],
    WHITE: 255,
    GRAY: [245, 245, 245],
    SHIFT_COLORS: {
      EARLY: [219, 234, 254],
      DAY: [220, 252, 231],
      LATE: [243, 232, 255],
      NIGHT: [229, 231, 235],
      COOKING: [254, 226, 226],
      WEEKEND: [254, 249, 195]
    }
  },
  MARGINS: {
    TOP: 20,
    RIGHT: 14,
    BOTTOM: 20,
    LEFT: 14
  },
  CELL_STYLES: {
    PADDING: 2,
    FIRST_COLUMN_WIDTH: {
      DAY_VIEW: 20,
      WEEK_VIEW: 15
    }
  }
}; 