export interface StatCard {
  title: string;
  value: number | string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
}

export interface Quiz {
  id: number;
  title: string;
  status: 'En cours' | 'Brouillon' | 'Clôturé';
  ue: string;
  questions: number;
  participation?: {
    current: number;
    total: number;
    rate: number;
  };
  type: string;
  endDate: string;
  classes: string[];
  createdDate: string;
}

export interface Alert {
  id: number;
  title: string;
  details: string;
  type: 'warning' | 'info' | 'error';
  date?: string;
}

export interface Activity {
  id: number;
  title: string;
  details: string;
  time: string;
  type: 'quiz' | 'evaluation' | 'report';
  icon: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}
