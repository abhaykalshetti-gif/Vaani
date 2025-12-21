
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decodePcmToAudioBuffer, base64ToBytes } from '../utils/audio';

interface LiveConfig {
  systemInstruction: string;
  onTranscript: (text: string, isUser: boolean, isFinal: boolean) => void;
  onClose: () => void;
  onError: (error: Error) => void;
  onOpen: () => void;
  onInterrupted: () => void;
}

export class GeminiLiveService {
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private currentInputTranscription = '';
  private currentOutputTranscription = '';
  private isConnected = false;

  public async connect(config: LiveConfig) {
    if (this.isConnected) return;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      
      this.inputAudioContext = new AudioContextClass({ sampleRate: 16000 });
      this.outputAudioContext = new AudioContextClass({ sampleRate: 24000 });

      if (this.inputAudioContext?.state === 'suspended') await this.inputAudioContext.resume();
      if (this.outputAudioContext?.state === 'suspended') await this.outputAudioContext.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true },
          channelCount: 1,
          sampleRate: 16000
        } 
      });

      this.sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: config.systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            this.isConnected = true;
            this.startStreamingInput(stream);
            config.onOpen();
          },
          onmessage: async (message: LiveServerMessage) => {
            await this.handleMessage(message, config);
          },
          onclose: () => {
            this.isConnected = false;
            config.onClose();
          },
          onerror: (e) => {
            console.error("Gemini Live API Error:", e);
            config.onError(new Error("Voice system encountered an interruption. Please try again."));
          },
        },
      });
    } catch (err: any) {
      console.error("Gemini Live Connect Error:", err);
      config.onError(err);
    }
  }

  private startStreamingInput(stream: MediaStream) {
    if (!this.inputAudioContext) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    // Use 1024 for lower latency and more frequent audio updates
    this.scriptProcessor = this.inputAudioContext.createScriptProcessor(1024, 1, 1);

    this.scriptProcessor.onaudioprocess = (e) => {
      if (!this.isConnected) return;
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Moderate gain to ensure voice clarity without amplifying background noise floor
      for (let i = 0; i < inputData.length; i++) {
        inputData[i] = inputData[i] * 1.5; 
      }
      
      const pcmBlob = createPcmBlob(inputData);
      this.sessionPromise?.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.inputSource.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage, config: LiveConfig) {
    if (message.serverContent?.interrupted) {
      for (const source of this.sources.values()) {
        try { source.stop(); } catch (e) {}
      }
      this.sources.clear();
      this.nextStartTime = 0;
      config.onInterrupted();
    }

    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputAudioContext) {
      const audioBuffer = await decodePcmToAudioBuffer(base64ToBytes(base64Audio), this.outputAudioContext, 24000, 1);
      
      const currentTime = this.outputAudioContext.currentTime;
      // Precision lookahead to prevent gap/jitter
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime + 0.05; 
      }
      
      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioContext.destination);
      source.addEventListener('ended', () => {
        this.sources.delete(source);
      });
      
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.sources.add(source);
    }

    if (message.serverContent?.outputTranscription) {
      const text = message.serverContent.outputTranscription.text;
      this.currentOutputTranscription += text;
      config.onTranscript(this.currentOutputTranscription, false, false);
    } else if (message.serverContent?.inputTranscription) {
      const text = message.serverContent.inputTranscription.text;
      this.currentInputTranscription += text;
      config.onTranscript(this.currentInputTranscription, true, false);
    }

    if (message.serverContent?.turnComplete) {
      if (this.currentInputTranscription) {
        config.onTranscript(this.currentInputTranscription, true, true);
        this.currentInputTranscription = '';
      }
      if (this.currentOutputTranscription) {
        config.onTranscript(this.currentOutputTranscription, false, true);
        this.currentOutputTranscription = '';
      }
    }
  }

  public sendText(text: string) {
    this.sessionPromise?.then((session) => {
      if (this.isConnected) {
        session.sendRealtimeInput({ text });
      }
    });
  }

  public async disconnect() {
    this.isConnected = false;
    if (this.sessionPromise) {
      const session = await this.sessionPromise;
      try { session.close(); } catch (e) {}
    }
    this.sessionPromise = null;
    if (this.scriptProcessor) this.scriptProcessor.disconnect();
    if (this.inputSource) this.inputSource.disconnect();
    for (const source of this.sources) try { source.stop(); } catch (e) {}
    this.sources.clear();
    if (this.inputAudioContext) await this.inputAudioContext.close();
    if (this.outputAudioContext) await this.outputAudioContext.close();
  }
}
