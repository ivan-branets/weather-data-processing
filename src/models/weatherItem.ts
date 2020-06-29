export interface IWeatherItem {
  date?: string;
  temperature: number;
  time?: string;
  time_local?: string;
  dewpoint?: number;
  humidity?: number;
  precipitation?: number;
  precipitation_3?: any;
  precipitation_6?: any;
  snowdepth?: number;
  windspeed?: number;
  peakgust?: number;
  winddirection?: number;
  pressure?: number;
  condition?: number;
};
