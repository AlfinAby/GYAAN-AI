// Audio Recording Hook
import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderReturn {
    isRecording: boolean;
    audioBlob: Blob | null;
    audioUrl: string | null;
    duration: number;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<Blob | null>;
    resetRecording: () => void;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const startTimeRef = useRef<number>(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            startTimeRef.current = Date.now();

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start(100); // Collect data every 100ms
            setIsRecording(true);
            setDuration(0);

            // Update duration every second
            timerRef.current = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);

        } catch (error) {
            console.error('Error starting recording:', error);
            throw new Error('Microphone access denied');
        }
    }, []);

    const stopRecording = useCallback(async (): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current) {
                resolve(null);
                return;
            }

            // Clear timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);

                setAudioBlob(blob);
                setAudioUrl(url);
                setIsRecording(false);
                setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));

                // Stop all tracks
                mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());

                resolve(blob);
            };

            mediaRecorderRef.current.stop();
        });
    }, []);

    const resetRecording = useCallback(() => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl(null);
        setDuration(0);
        chunksRef.current = [];
    }, [audioUrl]);

    return {
        isRecording,
        audioBlob,
        audioUrl,
        duration,
        startRecording,
        stopRecording,
        resetRecording
    };
};

export default useAudioRecorder;
