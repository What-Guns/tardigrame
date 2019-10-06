import {audioContext} from './audio.js';

let loaded = Promise.resolve();

export function loadImage(url: string): HTMLImageElement {
  const image = new Image();
  loaded = loaded.then(() => new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(`Could not load image ${url}`);
    image.src = url;
  }));
  return image;
}

export function loadAudioIntoBuffer(url: string, target: any, propertyKey: string) {
  loaded = loaded.then(() => new Promise<void>((resolve, reject) => {
    fetch(url)
    .then(data => {
      if(data.status < 200 || data.status > 400) reject(`Error audio-loading ${url}`);
      return data.arrayBuffer();
    }).then(ab => {
      audioContext.decodeAudioData(ab, (data: AudioBuffer) => {
        target[propertyKey] = data;
        return;
      }, (e) => {
        reject(`Could not decode ${url}: ${e}`);
      });
    }).then(resolve)
  }));
  return target;
}

export function fillWithImage(url: string): PropertyDecorator {
  return function(target: any, propertyKey: string|symbol) {
    target[propertyKey] = loadImage(url);
  }
}

export function isLoaded() {
  return loaded;
}
