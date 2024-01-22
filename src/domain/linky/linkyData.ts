export class LinkyDataElement {
  time: Date;
  value: number;
  value_at_normal_temperature: number;
  jour?: string;
  semaine?: string;
  mois?: string;
  annee?: string;
}

export class YearMonthLinkyData {
  years: Map<number, MonthLinkyData>;
  constructor() {
    this.years = new Map();
  }
}
export class MonthLinkyData {
  months: Map<number, LinkyDataElement[]>;
  constructor() {
    this.months = new Map();
  }
}
export class LinkyData {
  constructor(data?: LinkyData) {
    if (data) {
      this.prm = data.prm;
      this.serie = data.serie;
      this.serie.forEach((element) => {
        element.time = new Date(element.time);
      });
    } else {
      this.serie = [];
    }
  }
  serie: LinkyDataElement[];
  prm: string;

  public addDataElement?(element: LinkyDataElement) {
    this.serie.push(element);
  }

  public extractLastNDays?(nombre: number): LinkyDataElement[] {
    let result = this.serie.slice(-nombre);
    result = result.map((elem) => {
      const new_data: LinkyDataElement = {
        time: elem.time,
        value: elem.value,
        value_at_normal_temperature: elem.value_at_normal_temperature,
        jour: new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(
          elem.time,
        ),
      };
      return new_data;
    });
    return result;
  }
  public extractLastNWeeks?(nombre: number): LinkyDataElement[] {
    let result: LinkyDataElement[] = [];
    let extract = this.serie.slice(-nombre * 7);
    for (
      let index_sem = 0;
      index_sem < extract.length;
      index_sem = index_sem + 7
    ) {
      let cumul = 0;
      let cumul_corrigee = 0;
      for (let index = index_sem; index < index_sem + 7; index++) {
        const element = extract[index];
        cumul += element.value;
        cumul_corrigee += element.value_at_normal_temperature;
      }
      result.push({
        time: this.serie[index_sem].time,
        value: cumul,
        value_at_normal_temperature: cumul_corrigee,
      });
    }
    return result;
  }
  public extractLastNMonths?(nombre: number, date: Date): LinkyDataElement[] {
    const result = [];
    const years_months = LinkyData.listMonthsFromDate(nombre, date);

    this.fillRequiredYearMonthsData(years_months);

    this.cumulateMonthData(years_months);

    years_months.years.forEach((year) => {
      year.months.forEach((month) => {
        result.push(month[0]);
      });
    });
    result.reverse();

    return result;
  }

  static listMonthsFromDate?(
    nombre: number,
    start_date: Date,
  ): YearMonthLinkyData {
    const result = new YearMonthLinkyData();
    let current_date = start_date;

    for (let index = 0; index < nombre; index++) {
      const current_year = current_date.getFullYear();
      if (!result.years.has(current_year)) {
        result.years.set(current_year, new MonthLinkyData());
      }
      const current_month = current_date.getMonth();
      result.years.get(current_year).months.set(current_month, []);
      current_date.setDate(0);
    }
    return result;
  }

  cumulateMonthData?(year_month_data: YearMonthLinkyData) {
    year_month_data.years.forEach((year, key_year) => {
      year.months.forEach((month, key_month) => {
        let cumul = 0;
        let cumul_corrigee = 0;
        month.forEach((element) => {
          cumul += element.value;
          cumul_corrigee += element.value_at_normal_temperature;
        });
        const date_to_set = new Date(key_year, key_month);
        year.months.set(key_month, [
          {
            time: date_to_set,
            value: cumul,
            value_at_normal_temperature: cumul_corrigee,
            mois: new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(
              date_to_set,
            ),
            annee: new Intl.DateTimeFormat('fr-FR', { year: 'numeric' }).format(
              date_to_set,
            ),
          },
        ]);
      });
    });
  }

  fillRequiredYearMonthsData?(year_month_data: YearMonthLinkyData) {
    this.serie.forEach((element) => {
      const current_year = element.time.getFullYear();
      const current_month = element.time.getMonth();
      if (year_month_data.years.get(current_year)) {
        const month_entry = year_month_data.years
          .get(current_year)
          .months.get(current_month);
        if (month_entry) {
          month_entry.push(element);
        }
      }
    });
  }
}
