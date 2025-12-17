import React from 'react';
import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

interface MarginCardProps {
  title: string;
  percentage: number;
  baseValue: number;
  usedValue: number;
  icon?: React.ReactNode;
}

export const MarginCard: React.FC<MarginCardProps> = ({ title, percentage, baseValue, usedValue, icon }) => {
  const totalAllowed = baseValue * (percentage / 100);
  const available = totalAllowed - usedValue;
  const isNegative = available < -0.01; // Tolerance for float errors
  const usagePercent = Math.min((usedValue / totalAllowed) * 100, 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full relative overflow-hidden">
      {isNegative && (
        <div className="absolute top-0 right-0 p-2">
            <div className="animate-pulse bg-red-100 p-1.5 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
        </div>
      )}
      
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-3 rounded-lg ${isNegative ? 'bg-red-50' : 'bg-slate-100'}`}>
          {icon || <TrendingUp className="w-6 h-6 text-slate-600" />}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
          <span className="text-xs font-medium text-accent">{percentage}% da Base</span>
        </div>
      </div>

      <div className="space-y-4 flex-grow">
        <div>
          <p className="text-sm text-slate-400">Margem Disponível</p>
          <p className={`text-2xl font-bold ${isNegative ? 'text-red-600' : 'text-emerald-600'}`}>
            {available.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-1000 ${isNegative ? 'bg-red-500' : 'bg-accent'}`} 
            style={{ width: `${Math.max(usagePercent, 0)}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
           <div>
             <p className="text-xs text-slate-400">Total Permitido</p>
             <p className="text-sm font-semibold text-slate-700">
               {totalAllowed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
             </p>
           </div>
           <div>
             <p className="text-xs text-slate-400">Utilizado</p>
             <p className="text-sm font-semibold text-slate-700">
               {usedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
             </p>
           </div>
        </div>
      </div>
      
      {isNegative && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-2 animate-in fade-in slide-in-from-bottom-2">
             <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
             <div>
                <p className="text-xs font-bold text-red-700">MARGEM NEGATIVA</p>
                <p className="text-xs text-red-600">O cliente estourou o limite em {Math.abs(available).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.</p>
             </div>
        </div>
      )}
    </div>
  );
};
