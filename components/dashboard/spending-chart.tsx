'use client';

import { formatCurrency } from '@/lib/utils';
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

const COLORS = ['#2626CC', '#10b981', '#f43f5e', '#f59e0b', '#8884d8', '#82ca9d'];

interface SpendingChartProps {
    chartData: any[];
    expense: number;
    currency: string;
}

export function SpendingChart({ chartData, expense, currency }: SpendingChartProps) {
    return (
        <div className="flex flex-col items-center justify-center flex-1 w-full">
            <div className="relative size-48 mb-8 w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={75}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text Overlay */}
                <div className="absolute inset-0 m-auto size-40 flex flex-col items-center justify-center pointer-events-none px-1 text-center">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Total Spent</span>
                    <span className="text-slate-800 text-[15px] sm:text-base font-extrabold whitespace-nowrap" title={formatCurrency(expense, currency)}>
                        {formatCurrency(expense, currency)}
                    </span>
                </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-4">
                {chartData.slice(0, 4).map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <div className="flex flex-col">
                            <span className="text-slate-500 text-xs truncate max-w-[80px]">{entry.name}</span>
                            <span className="text-slate-800 text-sm font-bold">
                                {expense > 0 ? ((entry.value / expense) * 100).toFixed(0) : 0}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
