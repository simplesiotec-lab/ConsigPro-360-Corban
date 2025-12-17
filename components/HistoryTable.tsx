
import React from 'react';
import { CalculationResult } from '../types';
import { Calendar, Building, FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface HistoryTableProps {
  calculations: CalculationResult;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ calculations }) => {
  const { rawItems, loan, creditCard, benefitCard, baseIR } = calculations;
  
  const sortedItems = [...rawItems].sort((a, b) => b.value - a.value);

  const negatives = [
      { name: 'Empréstimo (35%)', data: loan },
      { name: 'Cartão Crédito (5%)', data: creditCard },
      { name: 'Cartão Benefício (5%)', data: benefitCard }
  ].filter(c => c.data.isNegative);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        {/* Alerta de Margem Negativa Estilizado */}
        {negatives.length > 0 && (
            <div className="bg-white border-2 border-red-500 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-red-50">
                <div className="bg-red-600 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <AlertTriangle className="w-6 h-6 animate-pulse" />
                        <span className="font-bold text-lg uppercase tracking-tight">Alerta Crítico: Margem Negativa</span>
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded text-xs text-white font-mono">
                        SIAPE - Análise 360°
                    </div>
                </div>
                <div className="p-6">
                    <p className="text-slate-600 mb-6">Identificamos comprometimento acima do limite legal para este servidor/pensionista baseado na renda de <strong>{baseIR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {negatives.map((neg, idx) => (
                            <div key={idx} className="bg-red-50 p-4 rounded-xl border border-red-200 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-red-700 font-bold text-sm uppercase mb-1">{neg.name}</h4>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-red-600">
                                            {neg.data.available.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-red-100 space-y-1">
                                    <div className="flex justify-between text-xs text-red-800">
                                        <span>Limite (Máx):</span>
                                        <span className="font-bold">{neg.data.limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-red-800">
                                        <span>Utilizado:</span>
                                        <span className="font-bold">{neg.data.used.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Resumo Consolidado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
                { label: 'Margem 35% (Empréstimo)', calc: loan, color: 'blue' },
                { label: 'Margem 5% (Cartão)', calc: creditCard, color: 'purple' },
                { label: 'Margem 5% (Benefício)', calc: benefitCard, color: 'orange' },
            ].map((item, idx) => (
                <div key={idx} className={`bg-white p-5 rounded-2xl border ${item.calc.isNegative ? 'border-red-200 shadow-inner' : 'border-slate-200 shadow-sm'}`}>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
                        {item.calc.isNegative ? (
                            <div className="bg-red-100 p-1 rounded-full"><AlertTriangle className="w-4 h-4 text-red-600" /></div>
                        ) : (
                            <div className="bg-emerald-100 p-1 rounded-full"><CheckCircle className="w-4 h-4 text-emerald-600" /></div>
                        )}
                    </div>
                    <p className={`text-2xl font-bold leading-none ${item.calc.isNegative ? 'text-red-600' : 'text-slate-800'}`}>
                        {item.calc.available.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                         <div className="text-[10px] text-slate-400">Limite: <b className="text-slate-600">{item.calc.limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b></div>
                         <div className="text-[10px] text-slate-400 text-right">Uso: <b className="text-slate-600">{item.calc.used.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b></div>
                    </div>
                </div>
            ))}
        </div>

        {/* Tabela de Contratos Detalhada */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-accent" />
                        Histórico Consolidado de Crédito
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Listagem completa do Demonstrativo de uso da Margem</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold">
                    <Info className="w-4 h-4" />
                    {rawItems.length} CONTRATOS ATIVOS
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100/50 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                    <th className="px-6 py-5">Instituição / Banco</th>
                    <th className="px-6 py-5">Contrato / Rubrica</th>
                    <th className="px-6 py-5">Tipo</th>
                    <th className="px-6 py-5 text-center">Parcela / Prazo</th>
                    <th className="px-6 py-5 text-right">Valor Parcela</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {sortedItems.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                Nenhum contrato identificado nos documentos.
                            </td>
                        </tr>
                    ) : (
                        sortedItems.map((item, index) => {
                        let type = "Outros";
                        let typeColor = "bg-slate-100 text-slate-600";
                        
                        if (item.description.toUpperCase().includes("EMPREST")) {
                            type = "Empréstimo";
                            typeColor = "bg-blue-50 text-blue-700 border border-blue-100";
                        } else if (item.description.toUpperCase().includes("CARTAO CREDITO")) {
                            type = "Cartão Crédito";
                            typeColor = "bg-purple-50 text-purple-700 border border-purple-100";
                        } else if (item.description.toUpperCase().includes("CARTAO BENEFICIO")) {
                            type = "Cartão Benefício";
                            typeColor = "bg-orange-50 text-orange-700 border border-orange-100";
                        }

                        return (
                            <tr key={index} className="hover:bg-slate-50/80 transition-all group">
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                        <Building className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 leading-none">{item.bank || "Banco"}</span>
                                        <span className="text-[10px] text-slate-400 mt-1 uppercase truncate max-w-[180px]">{item.description.split('-')[0]}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex flex-col">
                                    <span className="font-mono text-xs text-slate-600 font-bold">{item.contract || "S/ Nº"}</span>
                                    <span className="text-[10px] text-slate-400">{item.startDate} até {item.endDate}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${typeColor}`}>
                                    {type}
                                </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                                <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-xs font-bold text-slate-600">
                                    <Calendar className="w-3 h-3 text-slate-400"/>
                                    {item.installmentIndex || "N/A"}
                                </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <span className="text-lg font-black text-slate-800 tracking-tighter">
                                    {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </td>
                            </tr>
                        );
                        })
                    )}
                </tbody>
                </table>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>ConsigPro 360° - SIAPE Intelligent Analysis</span>
                <span className="text-slate-300 italic">Geração em tempo real via Gemini IA</span>
            </div>
        </div>
    </div>
  );
};
