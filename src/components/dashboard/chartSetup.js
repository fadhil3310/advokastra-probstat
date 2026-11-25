import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

let isRegistered = false;

export function ensureChartsRegistered() {
  if (isRegistered) return;
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
  );
  isRegistered = true;
}

export const BASE_CHART_FONT = {
  family: '"Geist", "Inter", system-ui, sans-serif',
  size: 11,
};

export const BASE_TOOLTIP_STYLE = {
  backgroundColor: '#09090B',
  titleColor: '#FAFAFA',
  bodyColor: '#E4E4E7',
  borderColor: '#27272A',
  borderWidth: 1,
  padding: 10,
  cornerRadius: 8,
  displayColors: true,
  boxPadding: 4,
};
