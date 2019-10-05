let loaded = Promise.resolve();

export function fillWithImage(url: string): PropertyDecorator {
  console.log(`loading ${url}`);
  return function(target: any, propertyKey: string) {
    const promise = new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => reject(`Could not load image ${url}`);
      image.src = url;
      target[propertyKey] = image;
    });
    loaded = loaded.then(() => promise);
  }
}

export function isLoaded() {
  console.log('asking if is loaded');
  return loaded;
}
