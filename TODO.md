# TODO

## AppShell / Navigation Follow-Ups

- Add SideNav collapse button UI and resizable drag handle support.
- Port TopNav/SideNav heading menu popovers if navigation menus become part of the public API.
- Add full mobile drawer transition parity with XDS, including auto side detection from the trigger position.

## Field / Input Follow-Ups

- Add FormLayout horizontal label context support for Field once FormLayout is ported.
- Add typed date parsing/formatting parity for DateInput and DateRangeInput; the first port uses Calendar popovers with read-only formatted text fields.

## Toast / Switch Follow-Ups

- Add a fallback self-mounting ToastViewport for useToast calls outside an explicit ToastViewport provider if we want XDS parity.
- Add optimistic async change action support to Switch if consumers need the XDS changeAction pattern.

## Typeahead / Tokenizer Follow-Ups

- Add XDS tokenizer overflow modes for `unfocusedInline` and `unfocusedLayer`; the first port keeps normal wrapping.
- Add stronger keyboard parity for MultiSelector and Typeahead menus, including typeahead navigation across options and select-all mixed state announcements.
