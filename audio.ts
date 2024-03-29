import {loadAudioAsync, loadAudioIntoBuffer} from "./loader.js";
import {Point} from './math.js';


export const audioContext = new AudioContext();
export const gainNode = new GainNode(audioContext);

export const biquadFilter = audioContext.createBiquadFilter();
biquadFilter.type = 'lowpass';
biquadFilter.frequency.setValueAtTime(22050, audioContext.currentTime);

gainNode.gain.value = 0.5;
gainNode.connect(biquadFilter);
biquadFilter.connect(audioContext.destination);

audioContext.listener.setOrientation(0, 0, -1, 0, 1, 0);

(window as any).ac = audioContext;

export function playSound(buffer: AudioBuffer) : void {
  const sound = audioContext.createBufferSource();
  sound.buffer = buffer;
  sound.connect(gainNode);
  sound.start(0);
};

export function playSoundLooped(buffer: AudioBuffer) : AudioBufferSourceNode {
  const sound = audioContext.createBufferSource();
  sound.buffer = buffer;
  sound.connect(gainNode);
  sound.loop = true;
  sound.start(0);
  return sound;
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


export type SoundLibrary<T extends string> = {
  [key in T]: AudioBuffer
};

export type SoundLibraryDescriptor<T extends string> = {
  [key in T]: string; 
}

export function createSoundLibrary<T extends string>(descriptor: SoundLibraryDescriptor<T>): SoundLibrary<T> {
  const library = {} as SoundLibrary<T>;
  for(const key in descriptor) {
    const name = key as T;
    const url = descriptor[name];
    loadAudioIntoBuffer(url, library, name, audioContext);
  }
  return library;
}

export async function createSoundLibraryAsync<T extends string>(descriptor: SoundLibraryDescriptor<T>) {
  const library = {} as SoundLibrary<T>;
  await Promise.all(Object.keys(descriptor).map(async key => {
    const name = key as T;
    const url = descriptor[name];
    library[name] = await loadAudioAsync(url, audioContext);
  }));
  return library;
}

const bgm = createSoundLibraryAsync({
  track0: 'assets/audio/music/TardigradeMusic1.ogg',
  track1: 'assets/audio/music/TardigradeMusic1.5.ogg',
  track2: 'assets/audio/music/TardigradeMusic2.ogg',
});

const track0GainNode = new GainNode(audioContext);
track0GainNode.gain.value = 0;
track0GainNode.connect(gainNode);
const track1GainNode = new GainNode(audioContext);
track1GainNode.gain.value = 0;
track1GainNode.connect(gainNode);
const track2GainNode = new GainNode(audioContext);
track2GainNode.gain.value = 0;
track2GainNode.connect(gainNode);

export async function startBGM() {
  const {track0, track1, track2} = await bgm;
  const sound0 = audioContext.createBufferSource();
  sound0.buffer = track0;
  sound0.connect(track0GainNode);
  sound0.loop = true;
  const sound1 = audioContext.createBufferSource();
  sound1.buffer = track1;
  sound1.connect(track1GainNode);
  sound1.loop = true;
  const sound2 = audioContext.createBufferSource();
  sound2.buffer = track2;
  sound2.connect(track2GainNode);
  sound2.loop = true;
  const startTime = audioContext.currentTime + 2;
  sound0.start(startTime);
  sound1.start(startTime);
  sound2.start(startTime);
}

function noopAudioEvent() {
  const time = audioContext.currentTime;
  track0GainNode.gain.setTargetAtTime(track0GainNode.gain.value,time,0);
  track1GainNode.gain.setTargetAtTime(track1GainNode.gain.value,time,0);
  track2GainNode.gain.setTargetAtTime(track2GainNode.gain.value,time,0);
}

export function fadeInBGM0() {
  noopAudioEvent()
  const time = audioContext.currentTime + 2;
  track0GainNode.gain.linearRampToValueAtTime(1, time);
  track1GainNode.gain.linearRampToValueAtTime(0, time);
  track2GainNode.gain.linearRampToValueAtTime(0, time);
}

export function fadeInBGM1() {
  noopAudioEvent()
  const time = audioContext.currentTime + 2;
  track0GainNode.gain.linearRampToValueAtTime(0, time);
  track1GainNode.gain.linearRampToValueAtTime(1, time);
  track2GainNode.gain.linearRampToValueAtTime(0, time);
}

export function fadeInBGM2() {
  noopAudioEvent()
  const time = audioContext.currentTime + 2;
  track0GainNode.gain.linearRampToValueAtTime(0, time);
  track1GainNode.gain.linearRampToValueAtTime(0, time);
  track2GainNode.gain.linearRampToValueAtTime(1, time);
}

(window as any).fade0 = fadeInBGM0;
(window as any).fade1 = fadeInBGM1;
(window as any).fade2 = fadeInBGM2;
