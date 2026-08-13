class AudioProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];

    if (input && input.length > 0) {
      const channelData = input[0];

      if (channelData) {
        this.port.postMessage(channelData);
      }
    }

    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);