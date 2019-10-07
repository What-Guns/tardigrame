let loaded = Promise.resolve();
export function loadImage(url) {
    const image = new Image();
    const row = addLoadingRow(url);
    document.getElementById('loading');
    const loadIt = () => new Promise((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(`Could not load image ${url}`);
        image.src = url;
    }).then(() => {
        row.remove();
    });
    enqueue(loadIt());
    return image;
}
export async function loadAudioAsync(url, audioContext) {
    const row = addLoadingRow(url);
    const response = await fetch(url);
    row.textContent = `Parsing ${url}`;
    if (response.status < 200 || response.status > 400) {
        const msg = `Error parsing ${url}`;
        row.textContent = msg;
        throw new Error(msg);
    }
    try {
        const audio = await parseAudio(audioContext, await response.arrayBuffer());
        row.remove();
        return audio;
    }
    catch (e) {
        row.textContent = e.message;
        throw e;
    }
}
export function loadAudioIntoBuffer(url, target, propertyKey, audioContext) {
    async function loadIt() {
        const audio = await loadAudioAsync(url, audioContext);
        target[propertyKey] = audio;
    }
    enqueue(loadIt());
}
export function fillWithImage(url) {
    return function (target, propertyKey) {
        target[propertyKey] = loadImage(url);
    };
}
export function isLoaded() {
    return loaded;
}
function enqueue(next) {
    loaded = loaded.then(() => next);
}
export function parseAudio(ctx, buffer) {
    return new Promise((resolve, reject) => {
        ctx.decodeAudioData(buffer, resolve, reject);
    });
}
export function addLoadingRow(asset) {
    const row = document.createElement('div');
    row.textContent = `Loading ${asset}`;
    document.getElementById('loading').appendChild(row);
    return row;
}
