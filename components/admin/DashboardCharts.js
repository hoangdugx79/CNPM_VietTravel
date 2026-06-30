import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { useEffect, useRef, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { formatCurrency } from '../../lib/format';

ChartJS.register(
  ArcElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

const MONTH_NAMES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
const TOUR_COLORS = ['#ff6b35', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];

export default function DashboardCharts({ revenueByMonth = [], topTours = [] }) {
  const lineContainerRef = useRef(null);
  const doughnutContainerRef = useRef(null);
  const [chartVersion, setChartVersion] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let frameId = null;
    const bumpCharts = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        setChartVersion((value) => value + 1);
      });
    };

    bumpCharts();

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => bumpCharts())
      : null;

    [lineContainerRef.current, doughnutContainerRef.current]
      .filter(Boolean)
      .forEach((element) => resizeObserver?.observe(element));

    window.addEventListener('resize', bumpCharts);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', bumpCharts);
      resizeObserver?.disconnect();
    };
  }, [revenueByMonth.length, topTours.length]);

  const revenueLabels = revenueByMonth.map((item) => `${MONTH_NAMES[item.Month - 1] || `T${item.Month}`}/${item.Year}`);
  const revenueData = revenueByMonth.map((item) => item.Revenue || 0);
  const bookingData = revenueByMonth.map((item) => item.BookingCount || 0);

  const topTourLabels = topTours.map((tour) => tour.Title || 'Chua dat ten');
  const topTourBookings = topTours.map((tour) => tour.BookingCount || 0);

  const lineChartData = {
    labels: revenueLabels,
    datasets: [
      {
        label: 'Doanh thu',
        data: revenueData,
        borderColor: '#ff6b35',
        backgroundColor: 'rgba(255, 107, 53, 0.16)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ff6b35',
      },
      {
        label: 'So booking',
        data: bookingData,
        borderColor: '#f5a623',
        backgroundColor: '#f5a623',
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y1',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 120,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          color: '#64748b',
          font: {
            family: 'Be Vietnam Pro',
            size: 12,
            weight: '600',
          },
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            if (context.dataset.label === 'Doanh thu') {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            }
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          maxRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#94a3b8',
          callback(value) {
            return formatCurrency(value);
          },
        },
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#94a3b8',
        },
      },
    },
  };

  const doughnutData = {
    labels: topTourLabels,
    datasets: [
      {
        data: topTourBookings,
        backgroundColor: TOUR_COLORS,
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 120,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          boxHeight: 10,
          padding: 16,
          color: '#64748b',
          font: {
            family: 'Be Vietnam Pro',
            size: 12,
            weight: '600',
          },
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.label}: ${context.parsed} booking`;
          },
        },
      },
    },
  };

  return (
    <div className="admin-dashboard-grid">
      <section className="admin-card admin-dashboard-card admin-dashboard-wide">
        <div className="card-header">
          <div>
            <div className="card-title"><i className="fas fa-chart-line" /> Doanh thu 6 thang gan day</div>
            <p className="admin-dashboard-subtitle">Theo doi doanh thu va luong booking tren dashboard admin.</p>
          </div>
        </div>
        <div className="card-body">
          {revenueByMonth.length > 0 ? (
            <div className="admin-chart-container" ref={lineContainerRef}>
              <Line
                key={`line-${chartVersion}-${revenueLabels.length}`}
                data={lineChartData}
                options={lineChartOptions}
                redraw
              />
            </div>
          ) : (
            <div className="admin-dashboard-empty">Chua co du lieu doanh thu de ve bieu do.</div>
          )}
        </div>
      </section>

      <section className="admin-card admin-dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title"><i className="fas fa-chart-pie" /> Top tour noi bat</div>
            <p className="admin-dashboard-subtitle">Ty trong booking cua cac tour duoc dat nhieu nhat.</p>
          </div>
        </div>
        <div className="card-body">
          {topTours.length > 0 ? (
            <div className="admin-chart-container admin-chart-container-compact" ref={doughnutContainerRef}>
              <Doughnut
                key={`doughnut-${chartVersion}-${topTourLabels.length}`}
                data={doughnutData}
                options={doughnutOptions}
                redraw
              />
            </div>
          ) : (
            <div className="admin-dashboard-empty">Chua co du lieu top tour de hien thi.</div>
          )}
        </div>
      </section>
    </div>
  );
}
