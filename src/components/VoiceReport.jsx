import { useState, useRef } from 'react';
import { aiAssistantAPI } from '../lib/api';

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function VoiceReport({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState(null); // 'transcribing' | 'thinking' | 'speaking' | null
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    audioPlayerRef.current?.pause();
    setRecording(false);
    setStatus(null);
    onClose();
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        handleRecordingComplete(audioBlob, mediaRecorder.mimeType);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Microphone access error:', err);
      setError("Couldn't access your microphone. Please allow microphone access and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const handleRecordingComplete = async (audioBlob, mimeType) => {
    setStatus('transcribing');
    setError(null);
    try {
      const base64 = await blobToBase64(audioBlob);
      const transcribeResult = await aiAssistantAPI.transcribe(base64, mimeType);
      if (!transcribeResult.success) {
        setError(transcribeResult.error || "Couldn't transcribe that recording.");
        setStatus(null);
        return;
      }
      const transcript = transcribeResult.transcript?.trim();
      if (!transcript) {
        setError("Didn't catch that - try recording again.");
        setStatus(null);
        return;
      }

      const nextMessages = [...messages, { role: 'user', content: transcript }];
      setMessages(nextMessages);
      setStatus('thinking');

      const chatResult = await aiAssistantAPI.chat(nextMessages);
      const reply = chatResult.success ? chatResult.reply : (chatResult.error || 'Something went wrong. Please try again.');
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      setStatus('speaking');
      const speakResult = await aiAssistantAPI.speak(reply);
      if (speakResult.success) {
        const audioUrl = `data:${speakResult.mime_type};base64,${speakResult.audio_base64}`;
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = audioUrl;
          await audioPlayerRef.current.play().catch(err => console.error('Playback error:', err));
        }
      }
      setStatus(null);
    } catch (err) {
      console.error('Voice report error:', err);
      setError('Something went wrong. Please try again.');
      setStatus(null);
    }
  };

  const statusLabel = {
    transcribing: 'Listening back to what you said…',
    thinking: 'Thinking…',
    speaking: 'Speaking…',
  }[status];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎙️ Voice Report</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--neutral-500)', marginBottom: '16px' }}>
            Press record and describe what happened - the AI assistant will listen, respond, and speak back.
          </p>

          {messages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', marginBottom: '16px', padding: '4px' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: msg.role === 'user' ? '#0a3d2e' : '#f1f5f4',
                  color: msg.role === 'user' ? 'white' : '#0a3d2e',
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 14px', background: '#fee', border: '1px solid #e63946', borderRadius: '8px', color: '#e63946', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={!!status}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                border: 'none',
                cursor: status ? 'default' : 'pointer',
                background: recording ? '#e63946' : '#0a3d2e',
                color: 'white',
                fontSize: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: status ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {recording ? '⏹' : '🎙️'}
            </button>
            <p style={{ fontSize: '13px', color: 'var(--neutral-500)', margin: 0 }}>
              {recording ? 'Recording… tap to stop' : statusLabel || 'Tap to record'}
            </p>
          </div>

          <audio ref={audioPlayerRef} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
}
