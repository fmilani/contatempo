import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

declare global {
  var __UI_SDK_STRICT__: boolean | undefined
}
globalThis.__UI_SDK_STRICT__ = true

HTMLElement.prototype.showPopover = function () {}
HTMLElement.prototype.hidePopover = function () {}
Element.prototype.getAnimations = () => []
// The bottom sheet slides with the Web Animations API, which jsdom lacks: finish at once.
Element.prototype.animate = function () {
  const done = Promise.resolve()
  return {
    finished: done,
    ready: done,
    cancel() {},
    finish() {},
    pause() {},
    play() {},
    commitStyles() {},
    addEventListener() {},
    removeEventListener() {},
    currentTime: 0,
    startTime: 0,
    playState: "finished",
    effect: null,
    onfinish: null,
  } as unknown as Animation
}
Element.prototype.scrollIntoView = function () {}
Element.prototype.checkVisibility = () => true
Element.prototype.getClientRects = () => [] as unknown as DOMRectList
document.elementFromPoint = () => null
document.elementsFromPoint = () => []
// The bottom sheet watches its own visibility, which jsdom can't report.
globalThis.IntersectionObserver ??= class {
  root = null
  rootMargin = ""
  thresholds = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
} as unknown as typeof IntersectionObserver
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// jsdom has no matchMedia; popups with presentation="auto" read it to choose a sheet.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }) as MediaQueryList
document.head.append(
  Object.assign(document.createElement("style"), {
    textContent: "[popover] { display: block !important }",
  })
)

afterEach(cleanup)

// Trigger menus place themselves at the caret, measured through a Range, which jsdom can't lay out.
const emptyRect = () => DOMRect.fromRect({ x: 0, y: 0, width: 0, height: 0 })
Range.prototype.getBoundingClientRect ??= emptyRect
Range.prototype.getClientRects ??= () => [] as unknown as DOMRectList

// jsdom has no isContentEditable, which shortcuts check so typing in a rich editor isn't a shortcut.
if (!("isContentEditable" in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, "isContentEditable", {
    get(this: HTMLElement) {
      const editable = this.closest("[contenteditable]")
      return editable !== null && editable.getAttribute("contenteditable") !== "false"
    },
  })
}
