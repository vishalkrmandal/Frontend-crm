import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Camera } from "lucide-react";
import { toast } from 'sonner';

interface WebcamCaptureProps {
    onCapture: (file: File, fieldName: string) => void;
    fieldName: string;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, fieldName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const openWebcam = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user', // For front camera, use 'environment' for back camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            setStream(mediaStream);
            setIsOpen(true);

            // Small delay to ensure the dialog is open before setting video source
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);

        } catch (error) {
            console.error("Error accessing webcam:", error);
            toast.error("Could not access camera. Please check permissions.");
        }
    };

    const closeWebcam = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsOpen(false);
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw the current video frame to the canvas
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
            } else {
                console.error("Failed to get 2D context from canvas");
                toast.error("Could not capture image. Please try again.");
            }

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    // Create a File object from the blob
                    const file = new File(
                        [blob],
                        `${fieldName}_${new Date().toISOString()}.jpg`,
                        { type: 'image/jpeg' }
                    );

                    // Call the onCapture callback with the file
                    onCapture(file, fieldName);
                    toast.success("Image captured successfully");
                    closeWebcam();
                }
            }, 'image/jpeg', 0.95);
        }
    };

    const switchCamera = async () => {
        if (stream) {
            // Stop current stream
            stream.getTracks().forEach(track => track.stop());

            try {
                // Get current facing mode
                const currentTrack = stream.getVideoTracks()[0];
                const currentFacingMode = currentTrack.getSettings().facingMode;

                // Toggle facing mode
                const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

                // Start new stream with toggled facing mode
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: newFacingMode }
                });

                setStream(newStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = newStream;
                }

            } catch (error) {
                console.error("Error switching camera:", error);
                toast.error("Failed to switch camera");
            }
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="outline"
                onClick={openWebcam}
                className="flex items-center"
            >
                <Camera className="mr-2 h-4 w-4" />
                Open Webcam
            </Button>

            <Dialog open={isOpen} onOpenChange={(open) => !open && closeWebcam()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Capture Image</DialogTitle>
                        {/* <Button
                            variant="ghost"
                            className="absolute right-4 top-4"
                            onClick={closeWebcam}
                        >
                            <X className="h-4 w-4" />
                        </Button> */}
                    </DialogHeader>

                    <div className="flex flex-col items-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-auto rounded-md"
                        />

                        {/* Hidden canvas for capturing frames */}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>

                    <DialogFooter className="flex justify-between sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={switchCamera}
                        >
                            Switch Camera
                        </Button>
                        <Button
                            type="button"
                            onClick={captureImage}
                        >
                            Capture
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default WebcamCapture;