import { loadAudioIntoBuffer } from "./loader.js";
import {Point} from './math.js';

export const audioContext = new AudioContext();
const gainNode = new GainNode(audioContext);
gainNode.gain.value = 0.5;
gainNode.connect(audioContext.destination);

audioContext.listener.setOrientation(0, 0, -1, 0, 1, 0);

(window as any).ac = audioContext;

export function playSound(buffer: AudioBuffer) : void {
  const sound = audioContext.createBufferSource();
  sound.buffer = buffer;
  sound.connect(gainNode);
  sound.start(0);
};

export function playSoundAtLocation(buffer: AudioBuffer, location: Point) {
  const sound = audioContext.createBufferSource();
  sound.buffer = buffer;

  const panner = audioContext.createPanner();
  panner.setPosition(location.x, location.y, 0);
  panner.setOrientation(0, 0, 1);
  panner.refDistance = 1;
  panner.maxDistance = 1000;
  sound.connect(panner);
  panner.connect(gainNode);
  sound.start(0);
}


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
