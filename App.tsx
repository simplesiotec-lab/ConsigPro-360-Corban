
import React, { useState, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { analyzeFinancialDocuments } from './services/geminiService';
import { ExtractedData, AnalysisView, CalculationResult } from './types';
import { MarginCard } from './components/MarginCard';
import { HistoryTable } from './components/HistoryTable';
import { 
  FileText, 
  CreditCard, 
  Wallet, 
  Briefcase, 
  RefreshCw,
  Search,
  ChevronRight,
  Calculator,
  AlertCircle,
  // Added missing icon imports
  Info,
  AlertTriangle
} from 'lucide-react';

const App: React.FC = () => {
  const [contrachequeFile, setContrachequeFile] = useState<File | null>(null);
  const [extratoFile, setExtratoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [data, setData] = useState<ExtractedData | null>(null);
  const [currentView, setCurrentView] = useState<AnalysisView>(AnalysisView.DASHBOARD);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!contrachequeFile) {
      setError("O Contracheque é obrigatório para extrair a base de cálculo (PENSÃO I.R / BASE I.R).");
      return;
    }
    
    setError(null);
    setIsAnalyzing(true);
    try {
      const result = await analyzeFinancialDocuments(contrachequeFile, extratoFile);
      setData(result);
      setCurrentView(AnalysisView.DASHBOARD);
    } catch (err: any) {
      setError(err.message || "Erro na análise.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculations: CalculationResult | null = useMemo(() => {
    if (!data) return null;

    const baseIR = data.baseIR || 0;
    const items = data.items || [];
    
    // 1. EMPRÉSTIMOS (35%)
    const loans = items.filter(i => 
        i.description.toUpperCase().trim().includes("EMPREST")
    );
    const usedLoan = loans.reduce((acc, curr) => acc + curr.value, 0);
    const loanLimit = Number((baseIR * 0.35).toFixed(2));
    const loanAvailable = Number((loanLimit - usedLoan).toFixed(2));

    // 2. CARTÃO CRÉDITO (5%)
    const creditCards = items.filter(i => 
        i.description.toUpperCase().trim().includes("AMORT CARTAO CREDITO")
    );
    const usedCreditCard = creditCards.reduce((acc, curr) => acc + curr.value, 0);
    const creditLimit = Number((baseIR * 0.05).toFixed(2));
    const creditAvailable = Number((creditLimit - usedCreditCard).toFixed(2));

    // 3. CARTÃO BENEFÍCIO (5%)
    const benefitCards = items.filter(i => 
        i.description.toUpperCase().trim().includes("AMORT CARTAO BENEFICIO")
    );
    const usedBenefitCard = benefitCards.reduce((acc, curr) => acc + curr.value, 0);
    const benefitLimit = Number((baseIR * 0.05).toFixed(2));
    const benefitAvailable = Number((benefitLimit - usedBenefitCard).toFixed(2));

    return {
      baseIR,
      loan: { 
          used: usedLoan, 
          items: loans, 
          limit: loanLimit, 
          available: loanAvailable,
          isNegative: loanAvailable < -0.01
      },
      creditCard: { 
          used: usedCreditCard, 
          items: creditCards, 
          limit: creditLimit, 
          available: creditAvailable,
          isNegative: creditAvailable < -0.01
      },
      benefitCard: { 
          used: usedBenefitCard, 
          items: benefitCards, 
          limit: benefitLimit, 
          available: benefitAvailable,
          isNegative: benefitAvailable < -0.01
      },
      rawItems: items
    };

  }, [data]);

  const renderContent = () => {
    if (!data || !calculations) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
           <div className="bg-slate-100 p-8 rounded-full mb-6">
              <Search className="w-12 h-12 text-slate-300" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Análise não iniciada</h3>
           <p className="text-slate-400 max-w-sm text-center text-sm">
             Carregue os PDFs oficiais do SIAPE para que nossa IA possa extrair as rubricas e calcular as margens.
           </p>
        </div>
      );
    }

    if (currentView === AnalysisView.HISTORY) {
        return <HistoryTable calculations={calculations} />;
    }

    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
        {/* Banner do Servidor */}
        <div className="bg-primary rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Calculator size={120} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/30">Dados Extraídos SIAPE</span>
                    <h2 className="text-3xl font-black mt-2 leading-none uppercase tracking-tighter">{data.contrachequeData?.servidor || "Servidor Identificado"}</h2>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs font-semibold text-slate-400">
                        {/* Fix: Info icon is now imported */}
                        <span className="flex items-center gap-1.5"><Info size={14}/> Matrícula: <b className="text-white">{data.contrachequeData?.matricula}</b></span>
                        <span className="flex items-center gap-1.5"><Briefcase size={14}/> {data.contrachequeData?.orgao}</span>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Renda Base IR (360°)</p>
                     <p className="text-4xl font-black text-emerald-400 tracking-tighter">
                        {calculations.baseIR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                     </p>
                     <p className="text-[10px] text-slate-500 mt-1">Competência: {data.contrachequeData?.competencia || "--"}</p>
                </div>
            </div>
        </div>

        {/* Dashboard de Margens */}
        {currentView === AnalysisView.DASHBOARD && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MarginCard 
                    title="Empréstimo (35%)"
                    percentage={35}
                    baseValue={calculations.baseIR}
                    usedValue={calculations.loan.used}
                    icon={<Wallet className="w-6 h-6 text-blue-600" />}
                />
                <MarginCard 
                    title="Cartão Crédito (5%)"
                    percentage={5}
                    baseValue={calculations.baseIR}
                    usedValue={calculations.creditCard.used}
                    icon={<CreditCard className="w-6 h-6 text-purple-600" />}
                />
                <MarginCard 
                    title="Cartão Benefício (5%)"
                    percentage={5}
                    baseValue={calculations.baseIR}
                    usedValue={calculations.benefitCard.used}
                    icon={<Briefcase className="w-6 h-6 text-orange-600" />}
                />
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl shadow-lg">
                <Calculator className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <span className="block text-lg font-black text-slate-900 leading-none tracking-tighter uppercase">ConsigPro <span className="text-accent">360°</span></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Análise de Margem Corban</span>
              </div>
            </div>
            
            {data && (
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                 <button 
                    onClick={() => setCurrentView(AnalysisView.DASHBOARD)}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${currentView === AnalysisView.DASHBOARD ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    Dashboard
                 </button>
                 <button 
                    onClick={() => setCurrentView(AnalysisView.HISTORY)}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${currentView === AnalysisView.HISTORY ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    Crédito
                 </button>
              </div>
            )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
            <div className="lg:col-span-1 space-y-4">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                    <FileText size={16}/> Documentação
                </h2>
                <FileUpload 
                    label="Contracheque (Obrigatório)" 
                    file={contrachequeFile} 
                    setFile={setContrachequeFile} 
                />
                <FileUpload 
                    label="Extrato Consignações" 
                    file={extratoFile} 
                    setFile={setExtratoFile} 
                />
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !contrachequeFile}
                    className={`
                        w-full flex items-center justify-center px-6 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl
                        ${isAnalyzing || !contrachequeFile 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-accent hover:bg-sky-600 active:scale-95 hover:shadow-sky-200'
                        }
                    `}
                >
                    {isAnalyzing ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Iniciar Análise 360°"}
                </button>
                {error && <div className="p-4 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-xl border border-red-100 flex gap-2"><AlertCircle size={14}/> {error}</div>}
            </div>

            <div className="lg:col-span-3">
                {renderContent()}
            </div>
        </div>

        {/* Botão de Alerta Margem Negativa Flutuante */}
        {calculations && (calculations.loan.isNegative || calculations.creditCard.isNegative || calculations.benefitCard.isNegative) && (
            <div className="fixed bottom-8 right-8 animate-bounce">
                <button 
                    onClick={() => setCurrentView(AnalysisView.HISTORY)}
                    className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl ring-4 ring-red-100 flex items-center gap-3 transition-transform active:scale-90"
                >
                    {/* Fix: AlertTriangle icon is now imported */}
                    <AlertTriangle className="w-6 h-6" />
                    <span className="font-black text-xs uppercase tracking-widest pr-4">Ver Margem Negativa</span>
                </button>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
