"use client"
import { useState, useRef, useEffect } from "react";


export default function Home() {
  const[isRecording, setIsRecording] = useState(false);
  const[stream, setStream] = useState<MediaStream | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");

  const[summary, setSummary] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
  const container = transcriptContainerRef.current;

  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}, [transcripts, interimTranscript]);

  const floatTo16BitPCM = (float32Array: Float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);

    for (let i = 0; i < float32Array.length; i++) {
      let sample = Math.max(-1, Math.min(1, float32Array[i]));

      sample = sample < 0
        ? sample * 0x8000
        : sample * 0x7fff;

      view.setInt16(i * 2, sample, true);
    }

    return buffer;
};

  const startRecording = async() =>{
    
    //actual microphone service one 
    //starts recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio:true
      })

      const audioContext = new AudioContext({
        sampleRate: 16000,
      });

      audioContextRef.current = audioContext

      await audioContext.audioWorklet.addModule(
        "/audio-process.js"
      );


      const source =
        audioContext.createMediaStreamSource(stream);

      sourceRef.current = source;

      const processor = new AudioWorkletNode(
        audioContext,
        "audio-processor"
      );

      processorRef.current = processor;


      source.connect(processor);

      processor.connect(audioContext.destination);

      await audioContext.resume();

      console.log("Audio context state:", audioContext.state);
     
      streamRef.current = stream;
      
      const socket = new WebSocket("ws://localhost:8080");

      socketRef.current = socket;

      setIsRecording(true);
      
      processor.port.onmessage = (event) => {
        const samples = event.data as Float32Array;

        const pcmData = floatTo16BitPCM(samples);

        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(pcmData);
        }
      };

      socket.onclose = () => {
      console.log("WebSocket closed");
    };

    socket.onmessage = (event)=>{
       const data = JSON.parse(event.data);
      
        if (data.type !== "transcript") {
          return;
        }

              if (data.isFinal) {
        setFullTranscript((prev) =>
          prev ? `${prev} ${data.transcript}` : data.transcript
        );

          setTranscripts((prev) => [
      ...prev,
      data.transcript,
    ]);

        setInterimTranscript("");
      }else {
        setInterimTranscript(data.transcript);
      }
    }

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
      
    } catch (error) {
      console.log("There is some problem while using microphone", error);
      
    }
  }

  const stopMicrophone = async() => {
    console.log(fullTranscript);
    console.log(transcripts);
    
    
    // Stop MediaRecorder
    recorderRef.current?.stop();

    // Stop microphone
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    // Close WebSocket
    socketRef.current?.close();

     if (audioContextRef.current) {
    await audioContextRef.current.close();
  }

  // Clear refs
  streamRef.current = null;
  sourceRef.current = null;
  processorRef.current = null;
  audioContextRef.current = null;

    setIsRecording(false);
    
  };

  const generateSuggestions = async() =>{
    if(transcripts.length == 0){
      console.log("no transciption");
      
      return
    }
    setLoadingSuggestions(true);
    try {
      const response = await fetch("/api/generate-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcript: transcripts.join(" "),
      }),
    });

    const data = await response.json();
    console.log(data.summary);

    setSummary(data.summary)
    console.log(summary);
    
    

    } catch (error) {
      console.log("Error while fetching suggestion ", error);
      
    }finally{
      setLoadingSuggestions(false);
    }
  }


  return (
    <div className="flex items-center justify-center min-h-screen">
  <div className="w-full max-w-md p-6 bg-black rounded-2xl">
    
    <h1 className="text-white mb-4">
      This is real time audio transcriber
    </h1>

    {!isRecording ? (
      <div className="flex items-center mb-4">
        <button
          onClick={startRecording}
          className="bg-white text-xl p-2 mr-3 text-black rounded-2xl hover:bg-gray-400"
        >
          Start
        </button>

        <span className="bg-blue-400 text-xl text-white rounded-2xl p-2">
          Press Start to Record
        </span>
      </div>
    ) : (
      <div className="flex items-center mb-4">
        <button
          onClick={stopMicrophone}
          className="bg-white text-xl p-2 mr-3 text-black rounded-2xl hover:bg-gray-400"
        >
          Stop
        </button>

        <span className="bg-orange-400 text-xl text-white rounded-2xl p-2">
          Recording...
        </span>
      </div>
    )}

    {/* Transcript window */}
    <div
      ref={transcriptContainerRef}
      className="h-32 overflow-y-auto rounded-lg border border-gray-700 p-4"
    >
      {transcripts.map((text, index) => (
        <p
          key={index}
          className="text-white leading-6"
        >
          {text}
        </p>
      ))}

      {interimTranscript && (
        <p className="text-gray-400 leading-6">
          {interimTranscript}
        </p>
      )}
    </div>

    <div className="mt-2">
      <div>
        <button onClick={()=>{setTranscripts([]); setInterimTranscript("") }}
         className="bg-white text-xl p-2 mr-3 text-black rounded-2xl hover:bg-gray-400">Reset</button>
        {
          !loadingSuggestions ? (<button onClick={generateSuggestions}  className="bg-white text-xl p-2 mr-3 text-black rounded-2xl hover:bg-gray-400">Generate Summary</button>)
          :(<button disabled={loadingSuggestions} className="bg-white text-xl p-2 mr-3 text-black rounded-2xl hover:bg-gray-400">Generating Summary...</button>)
        }
      </div>
      <div className="h-32 overflow-y-auto rounded-lg border border-gray-700 p-4 mt-2">
            <span className="text-white">
              {summary}
            </span>
          </div>
    </div>

  </div>
</div>
  );
}
