// src/utils/isoWeekUtils.ts
import { startOfWeek, endOfWeek, getISOWeek, getISOWeekYear, setISOWeek, setISOWeekYear } from 'date-fns';

/**
 * Obtiene el número de semana ISO 8601 de una fecha
 * Las semanas ISO empiezan en lunes
 * La semana 1 es la que contiene el 4 de enero
 */
export const getISOWeekNumber = (date: Date): number => {
    return getISOWeek(date);
};

/**
 * Obtiene el año ISO de una fecha
 * Importante: El año ISO puede diferir del año calendario
 * Ej: 31 dic 2018 es semana 1 del año ISO 2019
 */
export const getISOYear = (date: Date): number => {
    return getISOWeekYear(date);
};

/**
 * Obtiene el rango de fechas de una semana ISO específica
 * @param weekNumber Número de semana ISO (1-53)
 * @param year Año ISO
 * @returns Objeto con fecha inicio (lunes) y fin (domingo) de la semana
 */
export const getISOWeekDateRange = (weekNumber: number, year: number) => {
    // Crear una fecha en la semana especificada
    let date = new Date(year, 0, 4); // 4 de enero siempre está en la semana 1
    date = setISOWeekYear(date, year);
    date = setISOWeek(date, weekNumber);

    // Obtener inicio y fin de la semana (lunes a domingo)
    const startDate = startOfWeek(date, { weekStartsOn: 1 }); // 1 = Lunes
    const endDate = endOfWeek(date, { weekStartsOn: 1 });

    return {
        startDate,
        endDate,
        startDateStr: startDate.toISOString().split('T')[0],
        endDateStr: endDate.toISOString().split('T')[0]
    };
};

/**
 * Obtiene el total de semanas ISO en un año
 * Algunos años tienen 53 semanas según ISO 8601
 */
export const getISOWeeksInYear = (year: number): number => {
    // Verificar si la semana 53 existe
    const lastWeekOfYear = getISOWeekDateRange(53, year);
    const weekNumber = getISOWeek(lastWeekOfYear.startDate);
    const weekYear = getISOWeekYear(lastWeekOfYear.startDate);

    // Si la semana 53 pertenece al año actual, entonces hay 53 semanas
    return (weekNumber === 53 && weekYear === year) ? 53 : 52;
};

/**
 * Convierte una fecha a string en formato "Semana W de YYYY"
 * Siguiendo el formato ISO 8601: YYYY-W##
 */
export const formatISOWeek = (date: Date): string => {
    const week = getISOWeek(date);
    const year = getISOWeekYear(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
};

/**
 * Parsea un string en formato ISO 8601 (YYYY-W##) a semana y año
 */
export const parseISOWeekString = (isoWeekStr: string): { year: number; week: number } | null => {
    const match = isoWeekStr.match(/^(\d{4})-W(\d{2})$/);
    if (!match) return null;

    return {
        year: parseInt(match[1]),
        week: parseInt(match[2])
    };
};

/**
 * Genera un array con todas las semanas de un año
 */
export const generateYearWeeks = (year: number): Array<{ week: number; dateRange: ReturnType<typeof getISOWeekDateRange> }> => {
    const totalWeeks = getISOWeeksInYear(year);
    const weeks = [];

    for (let week = 1; week <= totalWeeks; week++) {
        weeks.push({
            week,
            dateRange: getISOWeekDateRange(week, year)
        });
    }

    return weeks;
};

/**
 * Obtiene la semana actual según ISO 8601
 */
export const getCurrentISOWeek = (): { week: number; year: number } => {
    const now = new Date();
    return {
        week: getISOWeek(now),
        year: getISOWeekYear(now)
    };
};