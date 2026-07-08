import React, { useState, useEffect, useRef } from 'react';
import { Copy, Share2, ExternalLink, QrCode, Check, Download, Printer, Search, Link as LinkIcon, Info } from 'lucide-react';

interface CopyableLinkProps {
  url: string;
  label?: string;
  category?: 'Online Store' | 'Business Invoice' | 'Affiliate & MLM' | 'System & Security' | 'Other';
  language: 'en' | 'sw';
  trackingId?: string;
  onTrackClick?: (trackingId: string) => void;
}

export default function CopyableLink({
  url,
  label,
  category = 'Other',
  language,
  trackingId,
  onTrackClick
}: CopyableLinkProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [customAlias, setCustomAlias] = useState('');
  const [campaignSource, setCampaignSource] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  // Auto-build trackable URL based on Custom Alias and Campaign parameters
  const finalUrl = React.useMemo(() => {
    try {
      const parsedUrl = new URL(url);
      if (customAlias) {
        parsedUrl.searchParams.set('alias', customAlias.trim().toLowerCase());
      }
      if (campaignSource) {
        parsedUrl.searchParams.set('campaign', campaignSource.trim().toLowerCase());
      }
      if (trackingId) {
        parsedUrl.searchParams.set('track_id', trackingId);
      }
      return parsedUrl.toString();
    } catch {
      // Fallback for relative paths or mock domains
      let built = url;
      const separator = built.includes('?') ? '&' : '?';
      if (customAlias) built += `${separator}alias=${encodeURIComponent(customAlias.trim())}`;
      if (campaignSource) built += `${built.includes('?') ? '&' : '?'}campaign=${encodeURIComponent(campaignSource.trim())}`;
      if (trackingId) built += `${built.includes('?') ? '&' : '?'}track_id=${encodeURIComponent(trackingId)}`;
      return built;
    }
  }, [url, customAlias, campaignSource, trackingId]);

  // QR Code URL using free secure public API with clean rendering
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=15&data=${encodeURIComponent(finalUrl)}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(finalUrl);
      } else {
        // Fallback for older browsers or restricted sandboxes
        const textArea = document.createElement("textarea");
        textArea.value = finalUrl;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onTrackClick && trackingId) {
        onTrackClick(trackingId);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: label || 'Hurex ERP Shared Link',
          text: language === 'sw' ? 'Angalia kiungo hiki kutoka Hurex ERP:' : 'Check out this link from Hurex ERP:',
          url: finalUrl,
        });
      } catch (err) {
        console.log('User cancelled share or API error:', err);
      }
    } else {
      // Fallback for desktop: trigger copy and show alert
      handleCopy();
      alert(
        language === 'sw'
          ? 'Native sharing haitumiki kwenye kifaa hiki. Kiungo kimenakiliwa kwenye Clipboard!'
          : 'Native sharing not supported on this device. Link copied to clipboard!'
      );
    }
  };

  const downloadQrCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Hurex_QR_${trackingId || 'link'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // If CORS or fetch fails, open in new window
      window.open(qrCodeUrl, '_blank');
    }
  };

  const printQrCode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - Hurex ERP</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                font-family: sans-serif;
                margin: 0;
              }
              img {
                width: 250px;
                height: 250px;
                margin-bottom: 20px;
              }
              h3 { margin: 5px 0; color: #1f2937; }
              p { color: #6b7280; font-size: 14px; word-break: break-all; max-width: 400px; text-align: center; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <img src="${qrCodeUrl}" />
            <h3>Hurex ERP Universal Link</h3>
            <p>${finalUrl}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const categoryColors = {
    'Online Store': 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
    'Business Invoice': 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
    'Affiliate & MLM': 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30',
    'System & Security': 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
    'Other': 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-150 dark:border-zinc-800/80 shadow-xs space-y-3.5 max-w-full">
      {/* Category Tag & Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${categoryColors[category]}`}>
            {category === 'Online Store' && (language === 'sw' ? 'Duka la Mtandaoni' : 'Online Store')}
            {category === 'Business Invoice' && (language === 'sw' ? 'Kuhusu Ankara/Stakabadhi' : 'Invoice & Receipts')}
            {category === 'Affiliate & MLM' && (language === 'sw' ? 'Affiliate & Tume' : 'Affiliate Link')}
            {category === 'System & Security' && (language === 'sw' ? 'Ulinzi & Mfumo' : 'System Invite')}
            {category === 'Other' && (language === 'sw' ? 'Kiungo cha Mfumo' : 'Universal Link')}
          </span>
          {label && (
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 truncate max-w-[150px] sm:max-w-[250px]">
              {label}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowQr(!showQr)}
            className={`p-1.5 rounded-xl transition ${
              showQr 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-400'
            }`}
            title="QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main URL Visual and Interactive Fields */}
      <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 overflow-hidden">
        <LinkIcon className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="text-[11px] font-mono font-bold text-zinc-600 dark:text-zinc-300 select-all truncate flex-1 leading-none">
          {finalUrl}
        </span>
      </div>

      {/* Live Customize Accordion / Custom Alias Panel */}
      <div className="bg-zinc-50/50 dark:bg-zinc-950/30 p-3 rounded-2xl space-y-2 text-xs">
        <span className="text-[10px] font-black text-zinc-450 dark:text-zinc-500 block uppercase tracking-wider">
          {language === 'sw' ? 'Badilisha Kiungo (SEO & SEO Aliases)' : 'Customize URL (SEO & Tracking)'}
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] text-zinc-400 font-bold block mb-1">
              {language === 'sw' ? 'Msimbo wa Kipekee' : 'Custom Alias'}
            </label>
            <input
              type="text"
              placeholder="e.g. upendo-sale"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
              className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-zinc-850 dark:text-white"
            />
          </div>
          <div>
            <label className="text-[9px] text-zinc-400 font-bold block mb-1">
              {language === 'sw' ? 'Chanzo cha Kampeni' : 'Campaign Source'}
            </label>
            <input
              type="text"
              placeholder="e.g. whatsapp-status"
              value={campaignSource}
              onChange={(e) => setCampaignSource(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
              className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-zinc-850 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <button
          onClick={handleCopy}
          className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 shadow-sm border ${
            copied
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? (language === 'sw' ? 'Nukuliwa' : 'Copied') : (language === 'sw' ? 'Nakili' : 'Copy')}</span>
        </button>

        <button
          onClick={handleShare}
          className="py-2 px-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-transparent text-zinc-700 dark:text-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{language === 'sw' ? 'Shiriki' : 'Share'}</span>
        </button>

        <button
          onClick={() => window.open(finalUrl, '_blank')}
          className="py-2 px-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-transparent text-zinc-700 dark:text-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{language === 'sw' ? 'Fungua' : 'Open'}</span>
        </button>

        <button
          onClick={() => setShowQr(!showQr)}
          className={`py-2 px-1 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 ${
            showQr
              ? 'bg-amber-500 border-amber-500 text-white'
              : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-transparent text-zinc-700 dark:text-zinc-200'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>QR Code</span>
        </button>
      </div>

      {/* QR Code Section Drawer with Action triggers (Print / Download) */}
      {showQr && (
        <div ref={qrRef} className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850 flex flex-col items-center gap-3 animate-fade-in">
          <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-40 h-40 object-contain block"
              crossOrigin="anonymous"
            />
          </div>
          
          <div className="flex gap-2 w-full">
            <button
              onClick={downloadQrCode}
              className="flex-1 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'sw' ? 'Pakua' : 'Download'}</span>
            </button>
            <button
              onClick={printQrCode}
              className="flex-1 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'sw' ? 'Chapa' : 'Print'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
