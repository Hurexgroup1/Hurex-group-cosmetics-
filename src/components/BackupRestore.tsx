import React, { useState, useRef } from 'react';
import { SystemData } from '../types';
import { 
  Database,
  Download,
  UploadCloud,
  FileCheck,
  RefreshCw,
  Info,
  CheckCircle,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

interface BackupRestoreProps {
  systemData: SystemData;
  onRestoreSystemData: (data: SystemData) => void;
  onAddAuditLog: (action: string, details: string) => void;
  formatMoney: (amount: number) => string;
}

export default function BackupRestore({
  systemData,
  onRestoreSystemData,
  onAddAuditLog,
  formatMoney
}: BackupRestoreProps) {
  const [dragActive, setDragActive] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exporters for general dumps
  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(systemData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", `Backup-Mauzo-Faida-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.removeChild(downloadAnchor);

    onAddAuditLog('Backup ya data', 'Mtumiaji amepakua manual backup ya hifadhidata ya mfumo kwa usalama wao.');
    setRestoreMessage('Backup imetenezwa kwa ufanisi. Faili ya JSON imepakuliwa kwenye kifaa chako.');
    setIsSuccess(true);
  };

  const handleUploadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result as string) as SystemData;
        
        // Basic schema validator
        if (!parsedData.products || !parsedData.sales || !parsedData.expenses || !parsedData.users) {
          throw new Error('Muundo wa faili si thabiti. Hakikisha ni backup rasmi ya mfumo wetu ya JSON.');
        }

        onRestoreSystemData(parsedData);
        onAddAuditLog('Urejeshwaji (Restore)', `Hifadhidata imerejeshwa vizuri: Bidhaa ${parsedData.products.length}, Mauzo ${parsedData.sales.length}, Matumizi ${parsedData.expenses.length}.`);
        
        setRestoreMessage('Kongole! Hifadhidata yako imerejeshwa kwa ufanisi mkubwa na data zote zimesakinishwa.');
        setIsSuccess(true);
      } catch (e: any) {
        setRestoreMessage(e.message || 'Kuna hitilafu iliyotokea wakati wa kusoma faili ya backup.');
        setIsSuccess(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-bold text-zinc-900 dark:text-white font-sans">Kuhifadhi na Kurejesha Kumbukumbu (Backup & Restore)</h4>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Mfumo unafanya Auto-Backup kila data inapohaririwa, na unaweza kupakua manual backup za SQLite/MySQL/PostgreSQL mtandaoni.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Card: Backup manual download */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex gap-3 items-center">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-sm text-zinc-800 dark:text-white">Hifadhi Data kwa Manually (Manual Backup)</h5>
              <p className="text-[11px] text-zinc-400">Tengeneza na pakua nakala ya hifadhidata ya duka kwa muda huu mmoja</p>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 font-medium">
            <div className="flex justify-between">
              <span>Jumla ya Bidhaa za kusafirisha:</span>
              <span className="font-bold text-zinc-900 dark:text-white">{systemData.products.length} Bidhaa</span>
            </div>
            <div className="flex justify-between">
              <span>Mauzo katika nakala:</span>
              <span className="font-bold text-zinc-900 dark:text-white">{systemData.sales.length} Invoices</span>
            </div>
            <div className="flex justify-between">
              <span>Mapato ya Shughuli kusafirishwa:</span>
              <span className="font-bold text-zinc-900 dark:text-white">{formatMoney(systemData.sales.reduce((sum, s) => sum + s.totalAmount, 0))} TZS</span>
            </div>
            <div className="flex justify-between">
              <span>Matumizi katika hifadhi:</span>
              <span className="font-bold text-zinc-900 dark:text-white">{systemData.expenses.length} Matukio</span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400">
            Kumbukumbu hii itatolewa kwa muundo thabiti wa JSON ambao unaweza kuhamishiwa kwenye mifumo mingine ya database kama SQLite au MySQL mtandaoni.
          </p>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Download Backup (.JSON file)
          </button>
        </div>

        {/* Right Card: Drag and Drop restore as specified by instructions */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex gap-3 items-center">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-sm text-zinc-800 dark:text-white">Pakia na Rejesha (Restore Backup)</h5>
              <p className="text-[11px] text-zinc-400">Rejesha orodha zote za duka ukitumia faili ya backup uliyopakua jana</p>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
              dragActive 
                ? 'border-blue-500 bg-blue-50/10' 
                : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".json"
              className="hidden"
            />
            <FileSpreadsheet className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300 block">Drag & Drop faili ya backup hapa au Gonga kuchagua</span>
            <span className="text-[10px] text-zinc-400 block mt-1">Inasaidia faili za backup za .json pekee</span>
          </div>

          {/* Notifications logs helper */}
          {restoreMessage && (
            <div className={`p-4 rounded-xl flex items-start gap-2 text-xs border ${
              isSuccess 
                ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400' 
                : 'bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40 text-rose-800 dark:text-rose-400'
            }`}>
              {isSuccess ? <CheckCircle className="w-4.5 h-4.5 shrink-0" /> : <AlertTriangle className="w-4.5 h-4.5 shrink-0" />}
              <span className="font-semibold leading-tight">{restoreMessage}</span>
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/40 p-4 rounded-xl text-xs flex gap-2 text-amber-800 dark:text-amber-400">
            <Info className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <p className="leading-tight">
              Onyo: Kurejesha data kutaondoa na kufuta orodha na mauzo yote ya hivi sasa duka hili, na kujaza data mpya kabisa zilizopo kwenye faili husika.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
