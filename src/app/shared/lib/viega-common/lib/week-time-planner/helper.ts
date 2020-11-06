// helper methods
// --------------

const addMinutes = function(date: Date, mins) {
  const newDate = new Date(date.valueOf());
  newDate.setMinutes(newDate.getMinutes() + mins);
  return newDate;
};

export const getTimeStepArray = (stepSize: number) => {
  const timeArray = [];
  let date = new Date(1970, 1, 1);
  const totalMinutes = 1440;
  const trips = Math.floor(totalMinutes / stepSize);
  let count = 0;

  while (count < trips) {
    date = addMinutes(date, stepSize);
    timeArray.push(date);
    count++;
  }
  return timeArray;
};

export const toDoubleDigit = (val: string | number) =>
  val.toString().length === 1 ? `0${val}` : val;
