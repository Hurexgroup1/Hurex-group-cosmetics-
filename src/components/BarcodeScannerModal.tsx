import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, RefreshCw, X, ShieldAlert, CheckCircle2, Volume2 } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

const playSuccessBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = 1000; // Standard high beep
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.08); // Short beep
  } catch (e) {
    console.error('Failed to play sound beep:', e);
  }
};

export default function BarcodeScannerModal({ isOpen, onClose, onScanSuccess }: BarcodeScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  // Get available cameras when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setSuccessCode(null);
    setError(null);

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Auto select back or environment camera if present
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment') ||
            device.label.toLowerCase().includes('camera 0')
          );
          setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
        } else {
          setError('Kifaa chako hakina kamera, au kamera haipatikani hivi sasa.');
        }
      })
      .catch((err) => {
        console.error('Error fetching cameras:', err);
        setError('Tafadhali ruhusu ufikiaji wa kamera (Camera Permission) ili uweze kuchanganua barcode.');
      });

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async (cameraId: string) => {
    if (!cameraId) return;
    try {
      setError(null);
      
      // Stop existing if any
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      const html5QrCode = new Html5Qrcode("scanner-reader");
      scannerRef.current = html5QrCode;
      setIsScanning(true);

      await html5QrCode.start(
        cameraId,
        {
          fps: 15,
          qrbox: (width, height) => {
            // Wider for barcode detection
            const boxWidth = Math.min(width * 0.85, 300);
            const boxHeight = Math.min(height * 0.45, 130);
            return { width: boxWidth, height: boxHeight };
          },
          aspectRatio: 1.333333 // 4:3 is standard camera preview
        },
        (decodedText) => {
          // Success Callback
          setSuccessCode(decodedText);
          playSuccessBeep();
          
          if (navigator.vibrate) {
            navigator.vibrate(120); // standard buzz
          }

          // Let user see success for a tiny fraction of a second, then close
          setTimeout(() => {
            onScanSuccess(decodedText);
            onClose();
          }, 600);
        },
        () => {
          // Silent failure on scanning frames (to prevent console flood)
        }
      );
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(`Kushindwa kuwasha kamera: ${err?.message || err}`);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        console.error('Error stopping scanner:', e);
      } finally {
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  };

  // Auto trigger scanner on camera select or startup
  useEffect(() => {
    if (isOpen && selectedCameraId) {
      const timer = setTimeout(() => {
        startScanner(selectedCameraId);
      }, 250);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }
  }, [isOpen, selectedCameraId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="barcode-scanner-modal">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative text-xs">
        
        {/* Header */}
        <div className="p-4.5 border-b border-zinc-150 flex justify-between items-center bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
            <h4 className="text-sm font-black text-zinc-800 uppercase tracking-wider">Changanua Barcode (Camera)</h4>
          </div>
          <button 
            onClick={() => {
              stopScanner().then(() => onClose());
            }}
            className="text-zinc-500 hover:text-zinc-800 bg-zinc-100 hover:bg-zinc-200 p-1.5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Main scanner panel */}
          <div className="relative aspect-4/3 bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200 flex items-center justify-center">
            
            {/* Target element for html5-qrcode */}
            <div id="scanner-reader" className="w-full h-full"></div>

            {/* Scanning Laser HUD overlay */}
            {isScanning && !successCode && !error && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center">
                {/* Visual scan frame */}
                <div className="w-[280px] h-[120px] border-2 border-dashed border-blue-500 rounded-xl relative">
                  {/* Glowing line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce" style={{ animationDuration: '3s' }}></div>
                  
                  {/* Corner indicator lines */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>
                </div>
                
                <p className="text-zinc-600 font-bold text-[10px] bg-white/80 border border-zinc-200/80 px-3 py-1 rounded-full mt-3 uppercase tracking-wider">
                  Weka barcode katikati ya kisanduku
                </p>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="absolute inset-0 bg-white/95 flex flex-col justify-center items-center p-6 text-center text-zinc-600 animate-fade-in">
                <ShieldAlert className="w-12 h-12 text-red-500 mb-2.5" />
                <p className="font-bold text-sm text-zinc-900 mb-2">Hitilafu ya Kamera</p>
                <p className="text-xs text-zinc-500 max-w-xs">{error}</p>
                <button 
                  onClick={() => selectedCameraId && startScanner(selectedCameraId)}
                  className="mt-4 px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold border border-zinc-200 rounded-lg transition"
                >
                  Jaribu Tena
                </button>
              </div>
            )}

            {/* Success indicator */}
            {successCode && (
              <div className="absolute inset-0 bg-blue-600/95 backdrop-blur-xs flex flex-col justify-center items-center text-white p-6 text-center animate-fade-in">
                <CheckCircle2 className="w-16 h-16 text-emerald-300 animate-scale-in mb-3" />
                <h5 className="font-extrabold text-lg">Barcode Imesomwa!</h5>
                <p className="font-mono text-zinc-100 mt-1 bg-black/30 px-3 py-1 rounded-md text-sm tracking-widest">{successCode}</p>
                <p className="text-[10px] text-zinc-200 mt-2 uppercase font-semibold">Tafadhali subiri, inaongezwa kwenye kikapu...</p>
              </div>
            )}
          </div>

          {/* Camera switcher */}
          {cameras.length > 1 && (
            <div className="flex items-center gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-150">
              <Camera className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] text-zinc-500 font-extrabold uppercase">Badili Kamera (Switch Camera):</span>
                <select
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="w-full bg-transparent border-0 font-bold text-zinc-800 p-0 text-xs focus:ring-0 cursor-pointer focus:outline-hidden mt-0.5 truncate"
                >
                  {cameras.map((cam, i) => (
                    <option key={cam.id} value={cam.id} className="bg-white text-zinc-900">
                      {cam.label || `Kamera ya ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
              <RefreshCw className="w-3.5 h-3.5 text-zinc-500 shrink-0 animate-spin-slow cursor-pointer" onClick={() => startScanner(selectedCameraId)} />
            </div>
          )}

          {/* Prompt description */}
          <div className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-xl flex items-start gap-2 text-zinc-600 leading-relaxed text-[10px]">
            <Volume2 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-zinc-800">Ushauri wa matumizi:</p>
              Hakikisha mwanga ni wa kutosha na barcode imenyooka. Mfumo utasikia mlio <strong className="text-zinc-800">"Beep"</strong> kiotomatiki na kuingiza bidhaa husika kwenye fomu ya mauzo.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
