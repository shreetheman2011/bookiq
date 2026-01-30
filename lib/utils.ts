export const formatGrade = (grade: string | null): string => {
  if (!grade) return 'Reader';
  
  // If it's already formatted (e.g. "9th Grade"), return it
  if (grade.toLowerCase().includes('grade')) return grade;
  
  const num = parseInt(grade);
  if (isNaN(num)) return grade;
  
  let suffix = 'th';
  if (num % 10 === 1 && num % 100 !== 11) suffix = 'st';
  else if (num % 10 === 2 && num % 100 !== 12) suffix = 'nd';
  else if (num % 10 === 3 && num % 100 !== 13) suffix = 'rd';
  
  return `${num}${suffix} Grade`;
};
