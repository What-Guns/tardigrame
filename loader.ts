let loaded = Promise.resolve();

export function loadImage(url: string): HTMLImageElement {
  const image = new Image();
  const row = addLoadingRow(url);
  document.getElementById('loading')
  const loadIt = () => new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(`Could not load image ${url}`);
    image.src = url;
  }).then(() => {
    row.remove();
  });
  enqueue(loadIt());
  return image;
}

export function loadAudioIntoBuffer(url: string, target: any, propertyKey: string, audioContext: AudioContext) {
  const row = addLoadingRow(url);
  const loadIt = (async () => {
    const response = await fetch(url);
    row.textContent = `Parsing ${url}`;
    if(response.status < 200 || response.status > 400) {
      const msg = `Error parsing ${url}`;
      row.textContent = msg;
      throw new Error(msg);
    }
    try {
      const audio = await parseAudio(audioContext, await response.arrayBuffer());
      console.log(`Assigning ${url}`);
      target[propertyKey] = audio;
      row.remove();
    } catch (e) {
      row.textContent = e.message;
    }
    console.log(`Done loading ${url}`);
  });
  enqueue(loadIt());
}

export function fillWithImage(url: string): PropertyDecorator {
  return function(target: any, propertyKey: string|symbol) {
    target[propertyKey] = loadImage(url);
  }
}

export function isLoaded() {
  return loaded;
}

function enqueue(next: Promise<void>) {
  loaded = loaded.then(() => next);
}

export function parseAudio(ctx: AudioContext, buffer: ArrayBuffer) {
  return new Promise<AudioBuffer>((resolve, reject) => {
    ctx.decodeAudioData(buffer, resolve, reject);
  });
}

export function addLoadingRow(asset: string) {
  const row = document.createElement('div');
  row.textContent = `Loading ${asset}`;
  document.getElementById('loading')!.appendChild(row);
  return row;
}
