import React from 'react';
import { DashboardSummary } from '@/types';

interface DashboardChartsProps {
  summary: DashboardSummary;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ summary }) => {
  const { monthly_stats } = summary;

  const totalStatus =
    summary.pending_orders + summary.completed_orders + summary.cancelled_orders || 1;
  const completedShare = (summary.completed_orders / totalStatus) * 100;
  const pendingShare = (summary.pending_orders / totalStatus) * 100;
  const cancelledShare = (summary.cancelled_orders / totalStatus) * 100;

  const donutStyle = {
    background: `conic-gradient(#10b981 0 ${completedShare}%, #f59e0b ${completedShare}% ${completedShare + pendingShare}%, #ef4444 ${completedShare + pendingShare}% 100%)`,
  };

  const statusCards = [
    { label: 'Completed', value: summary.completed_orders, share: completedShare, color: 'bg-emerald-500', text: 'text-emerald-600' },
    { label: 'Pending', value: summary.pending_orders, share: pendingShare, color: 'bg-amber-500', text: 'text-amber-600' },
    { label: 'Cancelled', value: summary.cancelled_orders, share: cancelledShare, color: 'bg-red-500', text: 'text-red-600' },
  ];

  // Revenue overview: amount_received per month
  const maxAmount = Math.max(...monthly_stats.map((m) => m.amount_received), 1);
  const orderLinePoints = monthly_stats
    .map((m, i) => {
      const x = 30 + i * 20;
      const y = 110 - (m.amount_received / maxAmount) * 82;
      return `${x},${y}`;
    })
    .join(' ');

  // Orders bar chart: order_count per month
  const maxOrders = Math.max(...monthly_stats.map((m) => m.order_count), 1);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-6 mb-8">
      {/* Orders Overview line chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500">
              Orders Overview
            </p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Total amount generated / month</h3>
          </div>
        </div>

        <div className="h-52">
          <svg viewBox="0 0 280 130" className="h-full w-full overflow-visible">
            {[0, 1, 2, 3].map((line) => (
              <line
                key={line}
                x1="25" x2="265"
                y1={20 + line * 28} y2={20 + line * 28}
                stroke="#e2e8f0" strokeDasharray="4 6"
              />
            ))}
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={orderLinePoints}
            />
            {monthly_stats.map((m, i) => {
              const x = 30 + i * 20;
              const y = 110 - (m.amount_received / maxAmount) * 82;
              return (
                <g key={m.month}>
                  <circle cx={x} cy={y} r="4" fill="#2563eb" />
                  <title>{m.month}: {m.order_count} orders, ${m.amount_received.toLocaleString()}</title>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          {monthly_stats.map((m) => (
            <span key={m.month}>{m.month}</span>
          ))}
        </div>
      </div>

      {/* Orders by status donut */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500">
              Status mix
            </p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Orders by status</h3>
          </div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div
            className="relative h-40 w-40 rounded-full border-[16px] border-slate-100"
            style={donutStyle}
          >
            <div className="absolute inset-[18px] rounded-full bg-white" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{summary.total_orders}</div>
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Total</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {statusCards.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">{Math.round(item.share)}%</span>
                <span className={`text-sm font-semibold ${item.text}`}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue & Orders bar charts */}
      <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="mb-5">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500">Performance</p>
          <h3 className="text-xl font-bold text-slate-900 mt-1">Revenue & Orders per month</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Revenue bar chart: amount_received / month */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-700 font-medium">Amount received / month</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              ${summary.total_completed_value.toLocaleString()}
            </p>
            <div className="mt-4 flex h-20 items-end gap-1">
              {monthly_stats.map((m) => (
                <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span
                    className="block w-full rounded-t-md bg-sky-400"
                    style={{ height: `${Math.max(6, (m.amount_received / maxAmount) * 80)}px`, minWidth: '10px' }}
                    title={`${m.month}: $${m.amount_received.toLocaleString()}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-400">
              {monthly_stats.map((m) => (
                <span key={m.month}>{m.month}</span>
              ))}
            </div>
          </div>

          {/* Orders bar chart: number_of_orders / month */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-700 font-medium">Number of orders / month</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{summary.total_orders} total</p>
            <div className="mt-4 flex h-20 items-end gap-1">
              {monthly_stats.map((m) => (
                <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span
                    className="block w-full rounded-t-md bg-violet-400"
                    style={{ height: `${Math.max(6, (m.order_count / maxOrders) * 80)}px`, minWidth: '10px' }}
                    title={`${m.month}: ${m.order_count} orders`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-400">
              {monthly_stats.map((m) => (
                <span key={m.month}>{m.month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
