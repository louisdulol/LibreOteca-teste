import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import {
  Camera,
  Upload,
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
  FileText,
  Zap,
} from 'lucide-react';
import { createWorker } from 'tesseract.js';

interface BackCoverScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTextExtracted: (text: string) => void;
  tituloLivro?: string;
}

export const BackCoverScannerModal: React.FC<BackCoverScannerModalProps> = ({
  isOpen,
  onClose,
  onTextExtracted,
  tituloLivro,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [step, setStep] = useState<'camera' | 'review'>('camera');

  // Iniciar Câmera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.warn('Erro ao reproduzir stream:', e));
      }
    } catch (err: any) {
      console.warn('Erro ao acessar câmera:', err);
      setCameraError(
        'Não foi possível iniciar a câmera diretamente. Você também pode enviar uma foto da contracapa.'
      );
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen && step === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, step, startCamera, stopCamera]);

  // Limpa o texto da contracapa removendo códigos de barras, ISBN e dados fiscais
  const limparTextoContracapa = (textoCru: string): string => {
    const linhas = textoCru.split('\n');
    const linhasLimpas = linhas
      .map(linha => linha.trim())
      .filter(linha => {
        if (!linha || linha.length < 3) return false;
        // Remove linhas de ISBN, código de barras, preço, etc.
        if (/^(isbn|cdd|cdu|r\$|preço|preco|cod|código)/i.test(linha)) return false;
        if (/^\d{9,13}[0-9X]?$/i.test(linha.replace(/[-\s]/g, ''))) return false;
        if (/^(www\.|http|editora|tiragem|impressão)/i.test(linha) && linha.length < 40) return false;
        return true;
      });

    return linhasLimpas.join(' ').replace(/\s+/g, ' ').trim();
  };

  // Processar Imagem com Tesseract OCR
  const processImageWithOCR = async (imageSrc: string) => {
    setIsProcessing(true);
    setProgressStatus('Inicializando leitor inteligente (OCR)...');
    setProgressPercent(15);

    try {
      const worker = await createWorker('por');
      setProgressStatus('Reconhecendo texto da contracapa...');
      setProgressPercent(45);

      const ret = await worker.recognize(imageSrc);
      setProgressPercent(85);
      await worker.terminate();

      const textoCru = ret.data.text || '';
      const textoFormatado = limparTextoContracapa(textoCru);

      setProgressPercent(100);
      setIsProcessing(false);

      if (textoFormatado && textoFormatado.length > 20) {
        setExtractedText(textoFormatado);
      } else {
        setExtractedText(
          textoCru.trim() ||
            'Não foi possível identificar um texto nítido na foto. Tente aproximar melhor a câmera ou focar na área iluminada do texto.'
        );
      }
      setStep('review');
    } catch (err) {
      console.error('Falha no OCR:', err);
      // Fallback em caso de erro no pacote de idioma português
      try {
        setProgressStatus('Tentando modo de leitura secundário...');
        const workerEn = await createWorker('eng');
        const retEn = await workerEn.recognize(imageSrc);
        await workerEn.terminate();
        const textoCru = retEn.data.text || '';
        setExtractedText(limparTextoContracapa(textoCru) || textoCru);
        setStep('review');
      } catch (err2) {
        console.error('Falha geral no OCR:', err2);
        setExtractedText(
          'Houve uma falha momentânea ao processar a imagem. Você pode digitar ou colar o resumo diretamente.'
        );
        setStep('review');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Capturar frame da Câmera
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setCapturedImage(dataUrl);
    stopCamera();
    processImageWithOCR(dataUrl);
  };

  // Enviar Arquivo de Foto
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCapturedImage(dataUrl);
        stopCamera();
        processImageWithOCR(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Confirmar e transferir texto
  const handleConfirm = () => {
    if (extractedText.trim()) {
      onTextExtracted(extractedText.trim());
    }
    onClose();
  };

  const handleReset = () => {
    setCapturedImage(null);
    setExtractedText('');
    setStep('camera');
    startCamera();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Escanear Resumo da Contracapa (OCR)"
      subtitle={
        tituloLivro
          ? `Aponte a câmera para a contracapa de "${tituloLivro}" para capturar o resumo oficial`
          : 'Aponte a câmera para a contracapa física do livro ou envie uma foto para ler o texto'
      }
      maxWidth="2xl"
      zIndex="z-[90]"
    >
      <div className="space-y-4">
        {step === 'camera' && (
          <div className="space-y-3">
            {/* Viewfinder da Câmera */}
            <div className="relative w-full aspect-4/3 sm:aspect-16/9 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              <canvas ref={canvasRef} className="hidden" />

              {/* Guia visual de enquadramento da contracapa */}
              {!cameraError && !isProcessing && (
                <div className="absolute inset-4 sm:inset-8 border-2 border-amber-400/70 border-dashed rounded-xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-amber-300 px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      Área de Foco da Contracapa
                    </span>
                  </div>

                  <p className="text-center text-[11px] sm:text-xs text-white/90 bg-black/60 backdrop-blur-xs py-1 px-3 rounded-lg mx-auto">
                    Mantenha o texto da sinopse centralizado e bem iluminado
                  </p>
                </div>
              )}

              {/* Alerta de erro se câmera falhar */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400" />
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Selecionar Foto da Galeria / Arquivo</span>
                  </button>
                </div>
              )}

              {/* Overlay de Processamento OCR */}
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                  <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                  <p className="text-sm font-bold text-white">{progressStatus}</p>
                  <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ações de Captura */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Carregar Imagem</span>
              </button>

              <button
                type="button"
                onClick={handleCapturePhoto}
                disabled={isProcessing || !!cameraError}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>Capturar Foto e Reconhecer</span>
              </button>
            </div>
          </div>
        )}

        {/* Etapa de Revisão e Edição do Texto Extraído */}
        {step === 'review' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Texto reconhecido da contracapa!
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Tirar outra foto</span>
              </button>
            </div>

            {capturedImage && (
              <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl items-center">
                <img
                  src={capturedImage}
                  alt="Foto capturada da contracapa"
                  className="w-16 h-16 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Foto da contracapa processada
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Revise o texto abaixo. Você pode editar palavras se a foto tiver ficado com algum reflexo.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Resumo Extraído (editável)</span>
              </label>
              <textarea
                rows={6}
                value={extractedText}
                onChange={e => setExtractedText(e.target.value)}
                placeholder="O texto reconhecido aparecerá aqui..."
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                Voltar à Câmera
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Inserir na Sinopse do Livro</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
