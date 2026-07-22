export function isComposingEvent(event: Event | {nativeEvent: Event}): boolean {
  const nativeEvent = 'nativeEvent' in event ? event.nativeEvent : event;
  // isComposing lives on both KeyboardEvent and InputEvent; read it
  // structurally so React change events (nativeEvent typed as Event) work.
  return (
    Reflect.get(nativeEvent, 'isComposing') === true ||
    Reflect.get(nativeEvent, 'keyCode') === 229
  );
}
