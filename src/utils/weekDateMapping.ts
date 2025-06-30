// src/utils/weekDateMapping.ts
export const weekToDateMap: { [key: number]: string } = {
    1: '2022-01-03', 2: '2022-01-10', 3: '2022-01-17', 4: '2022-01-24', 5: '2022-01-31',
    6: '2022-02-07', 7: '2022-02-14', 8: '2022-02-21', 9: '2022-02-28', 10: '2022-03-07',
    11: '2022-03-14', 12: '2022-03-21', 13: '2022-03-28', 14: '2022-04-04', 15: '2022-04-11',
    16: '2022-04-18', 17: '2022-04-25', 18: '2022-05-02', 19: '2022-05-09', 20: '2022-05-16',
    21: '2022-05-23', 22: '2022-05-30', 23: '2022-06-06', 24: '2022-06-13', 25: '2022-06-20',
    26: '2022-06-27', 27: '2022-07-04', 28: '2022-07-11', 29: '2022-07-18', 30: '2022-07-25',
    31: '2022-08-01', 32: '2022-08-08', 33: '2022-08-15', 34: '2022-08-22', 35: '2022-08-29',
    36: '2022-09-05', 37: '2022-09-12', 38: '2022-09-19', 39: '2022-09-26', 40: '2022-10-03',
    41: '2022-10-10', 42: '2022-10-17', 43: '2022-10-24', 44: '2022-10-31', 45: '2022-11-07',
    46: '2022-11-14', 47: '2022-11-21', 48: '2022-11-28', 49: '2022-12-05', 50: '2022-12-12',
    51: '2022-12-19', 52: '2022-12-26'
};

export const getWeekDateRange = (weekNumber: number) => {
    const startDateStr = weekToDateMap[weekNumber];
    if (!startDateStr) return null;

    const startDate = new Date(startDateStr + 'T00:00:00');
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
};

export const getWeekNumberFromDate = (date: Date): number => {
    const dateStr = date.toISOString().split('T')[0];

    // Buscar coincidencia exacta
    for (const [week, weekDate] of Object.entries(weekToDateMap)) {
        if (weekDate === dateStr) {
            return parseInt(week);
        }
    }

    // Buscar en qué rango cae
    for (const [week, weekStartStr] of Object.entries(weekToDateMap)) {
        const range = getWeekDateRange(parseInt(week));
        if (range && date >= range.startDate && date <= range.endDate) {
            return parseInt(week);
        }
    }

    return 1;
};