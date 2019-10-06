import { loadAudioIntoBuffer } from "./loader.js";

export const audioContext = new AudioContext();
const gainNode = new GainNode(audioContext);
gainNode.gain.value = 0.1;
gainNode.connect(audioContext.destination);

export function playSound(buffer: AudioBuffer) : void {
  const sound = audioContext.createBufferSource();
  sound.buffer = buffer;
  sound.connect(gainNode);
  sound.start(0);
};


type SoundLibrary<T extends string> = {
  [key in T]: AudioBuffer
};

type SoundLibraryDescriptor<T extends string> = {
  [key in T]: string; 
}

export function createSoundLibrary<T extends string>(descriptor: SoundLibraryDescriptor<T>): SoundLibrary<T> {
  const library = {} as SoundLibrary<T>;
  for(const key in descriptor) {
    const name = key as T;
    const url = descriptor[name];
    loadAudioIntoBuffer(url, library, name);
  }
  return library;
}
