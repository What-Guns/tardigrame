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

export function fillWithImage(url: string): PropertyDecorator {
  return function(target: any, propertyKey: string|symbol) {
    target[propertyKey] = loadImage(url);
  }
}

export function isLoaded() {
  return loaded;
}
