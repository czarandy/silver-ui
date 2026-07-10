export function isComposingEvent(
  event: KeyboardEvent | {nativeEvent: KeyboardEvent},
): boolean {
  const nativeEvent = 'nativeEvent' in event ? event.nativeEvent : event;
  return nativeEvent.isComposing || Reflect.get(nativeEvent, 'keyCode') === 229;
}
