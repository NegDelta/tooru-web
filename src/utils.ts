export const timeFormat = (timestr: string) => new Date(Number(timestr)).toDateString();

export const prettyTrim = (str: string, maxLength = 100) => {
  return str.length < maxLength ? str : str.substring(0, maxLength - 3) + `... (${str.length} total)`;
};
