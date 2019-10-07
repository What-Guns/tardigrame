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

const bgm = createSoundLibrary({
  track1: 'assets/audio/music/TardigradeMusic1.ogg',
  track2: 'assets/audio/music/TardigradeMusic2.ogg',
});

const track1GainNode = new GainNode(audioContext);
track1GainNode.gain.value = 0;
const track2GainNode = new GainNode(audioContext);
track2GainNode.gain.value = 0;

export function startBGM() {
  const sound1 = audioContext.createBufferSource();
  sound1.buffer = bgm.track1;
  sound1.connect(track1GainNode);
  const sound2 = audioContext.createBufferSource();
  sound2.buffer = bgm.track2;
  sound2.connect(track2GainNode);
  const startTime = audioContext.currentTime + 200;
  sound1.start(startTime);
  sound2.start(startTime);
}

export function fadeInBGM1() {
  const time = audioContext.currentTime + 2000;
  track1GainNode.gain.linearRampToValueAtTime(1, time);
  track2GainNode.gain.linearRampToValueAtTime(0, time);
}

export function fadeInBGM2() {
  const time = audioContext.currentTime + 2000;
  track1GainNode.gain.linearRampToValueAtTime(0, time);
  track2GainNode.gain.linearRampToValueAtTime(1, time);
}
