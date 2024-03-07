import data from "./vacations.json";

type OldVacationDto = {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  usedDays: number;
  status?: string;
  startDate: string;
  endDate: string;
};

type NewVacationDto = {
  userId: string;
  name: string;
  weekendDates: { startDate: string; endDate: string }[];
};

class Vacation {
  private vacation: NewVacationDto;

  constructor(vacation: NewVacationDto) {
    this.vacation = vacation;
  }

  toString(): string {
    let str = "  {\n";
    str += `    userId: \x1b[32m${this.vacation.userId}\x1b[0m,\n`;
    str += `    name: \x1b[32m${this.vacation.name}\x1b[0m,\n`;
    str += `    weekenDates: [\n`;
    this.vacation.weekendDates.forEach((weekendDate) => {
      str += `      { startDate: \x1b[32m${weekendDate.startDate}\x1b[0m, endDate: \x1b[32m${weekendDate.endDate}\x1b[0m },\n`;
    });
    str += "    ]\n  }\n";

    return str;
  }
}

const getFormattedVacations = (vacations: OldVacationDto[]): Vacation[] => {
  const formattedVacations = new Map<string, NewVacationDto>();

  vacations.forEach((vacation) => {
    if (!formattedVacations.has(vacation._id)) {
      formattedVacations.set(vacation._id, {
        userId: vacation.user._id,
        name: vacation.user.name,
        weekendDates: [
          { startDate: vacation.startDate, endDate: vacation.endDate },
        ],
      });
    } else {
      formattedVacations.get(vacation._id)?.weekendDates.push({
        startDate: vacation.startDate,
        endDate: vacation.endDate,
      });
    }
  });

  return Array.from(formattedVacations.values()).map(
    (vacation) => new Vacation(vacation)
  );
};

const main = () => {
  console.log(`[\n${getFormattedVacations(data)}]`);
};

main();
