export function requestFullscreen(
  el: Element,
  options?: FullscreenOptions
): Promise<void> {
  if (el.requestFullscreen) {
    return el.requestFullscreen(options);
    /* @ts-ignore */
  } else if (el.webkitRequestFullscreen) {
    /* @ts-ignore */
    return el.webkitRequestFullscreen(options);
    /* @ts-ignore */
  } else if (el.mozRequestFullScreen) {
    /* @ts-ignore */
    return el.mozRequestFullScreen(options);
    /* @ts-ignore */
  } else if (el.msRequestFullscreen) {
    /* @ts-ignore */
    return el.msRequestFullscreen(options);
  }
  return Promise.reject('Fullscreen API is not supported.');
}

export function exitFullscreen() {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
    /* @ts-ignore */
  } else if (document.webkitExitFullscreen) {
    /* @ts-ignore */
    return document.webkitExitFullscreen();
    /* @ts-ignore */
  } else if (document.mozCancelFullScreen) {
    /* @ts-ignore */
    return document.mozCancelFullScreen();
    /* @ts-ignore */
  } else if (document.msExitFullscreen) {
    /* @ts-ignore */
    return document.msExitFullscreen();
  }
  return Promise.reject('Fullscreen API is not supported.');
}
