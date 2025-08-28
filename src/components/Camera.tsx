import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, CameraOff, RotateCcw, Download, X } from 'lucide-react';

interface CameraProps {
  onImageCapture: (imageData: string) => void;
  onImageRemove: () => void;
  capturedImage?: string;
}

export function CameraComponent({ onImageCapture, onImageRemove, capturedImage }: CameraProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !isStreaming) return;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    onImageCapture(imageData);
    stopCamera();
  }, [isStreaming, onImageCapture, stopCamera]);

  const retakePhoto = useCallback(() => {
    onImageRemove();
    startCamera();
  }, [onImageRemove, startCamera]);

  const downloadImage = useCallback(() => {
    if (!capturedImage) return;
    
    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = 'hazard-photo-' + new Date().getTime() + '.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [capturedImage]);

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (capturedImage) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <img
              src={capturedImage}
              alt="Ảnh đã chụp"
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={onImageRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={retakePhoto} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Chụp lại
            </Button>
            <Button onClick={downloadImage} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Tải xuống
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative">
          {isStreaming ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover rounded-lg bg-gray-100"
            />
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              {error ? (
                <div className="text-center text-red-600 p-4">
                  <CameraOff className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">{error}</p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Ấn "Bật Camera" để bắt đầu</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {!isStreaming ? (
            <Button onClick={startCamera} className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Bật Camera
            </Button>
          ) : (
            <>
              <Button onClick={captureImage} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Chụp Ảnh
              </Button>
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                <CameraOff className="h-4 w-4 mr-2" />
                Tắt Camera
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}