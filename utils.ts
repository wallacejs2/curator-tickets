
export const formatDisplayName = (text: string | undefined): string => {
  if (!text) return '';

  // Handle priorities like P1, P2 etc.
  if (/^P\d$/.test(text)) {
    return text;
  }
  
  // Handle acronyms like UCP, FOCUS
  if (text === text.toUpperCase()) {
    return text;
  }

  // Handle CamelCase like NotStarted -> Not Started
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};
