import { fgCache, doc, isEnabled_, VTr, isAlive_, timeout_, clearTimeout_, interval_ } from "../lib/utils"
import { ui_box, ensureBorder, addUIElement, adjustUI } from "./dom_ui"
import { allLinkHints } from "./link_hints"
import { isHTML_, createElement_ } from "../lib/dom_utils"

let tweenId = 0
let box: HTMLDivElement | null = null
let $text: Text = null as never
let text = ""
let opacity_: 0 | 0.25 | 0.5 | 0.75 | 1 = 0
let enabled = false
let timer = TimerID.None
let st: CSSStyleDeclaration

export { box as hud_box, text as hud_text, opacity_ as hud_opacity }
export function hudResetTextProp (): void { text = "" }
export function enableHUD (): void { enabled = true }

export const hudCopied = function (text: string, e?: "url" | "", virtual?: 1): string | void {
  if (!text) {
    if (virtual) { return text; }
    return hudTip(e ? kTip.noUrlCopied : kTip.noTextCopied, 1000);
  }
  if (text.startsWith(!(Build.BTypes & ~BrowserType.Firefox) ? "moz-" : "chrome-") && text.includes("://")) {
    text = text.slice(text.indexOf("/", text.indexOf("/") + 2) + 1) || text;
  }
  text = (text.length > 41 ? text.slice(0, 41) + "\u2026" : text + ".");
  return virtual ? text : hudTip(kTip.copiedIs, 2000, [text]);
} as {
(text: string, type: string, virtual: 1): string
(text: string, type?: "url" | ""): void
}

export const hudTip = (tid: kTip | HintMode, duration?: number, args?: Array<string | number>): void => {
  hudShow(tid, args);
  text && (timer = timeout_(hudHide, duration || 1500));
}
export const hudShow = (tid: kTip | HintMode, args?: Array<string | number>, embed?: boolean): void => {
  if (!enabled || !isHTML_()) { return; }
  text = VTr(tid, args);
  opacity_ = 1;
  if (timer) { clearTimeout_(timer); timer = TimerID.None; }
  embed || tweenId || (tweenId = interval_(tween, 40));
  let el = box;
  if (el) {
    $text.data = text;
    if (Build.MinCVer <= BrowserVer.StyleSrc$UnsafeInline$MayNotImply$UnsafeEval
        && Build.BTypes & BrowserType.Chrome) {
      embed && (el.style.opacity = el.style.visibility = "");
      return;
    }
    embed && (el.style.cssText = "");
    return;
  }
  el = createElement_("div");
  el.className = "R HUD" + fgCache.d;
  el.textContent = text;
  $text = el.firstChild as Text;
  st = el.style;
  if (!embed) {
    st.opacity = "0";
    st.visibility = "hidden";
    ui_box || ensureBorder();
  }
  addUIElement(box = el, allLinkHints ? AdjustType.NotAdjust : AdjustType.DEFAULT, );
}

const tween = (fake?: TimerType.fake): void => { // safe-interval
  let opacity = Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinNo$TimerType$$Fake
                && fake ? 0 : +(st.opacity || 1);
  if (opacity === opacity_) { /* empty */ }
  else if (opacity === 0) {
    $text.data = text;
    st.opacity = fgCache.m
        || Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinNo$TimerType$$Fake && fake
        ? "" : "0.25";
    st.visibility = "";
    return adjustUI();
  } else if (!fgCache.m && doc.hasFocus()) {
    opacity += opacity < opacity_ ? 0.25 : -0.25;
  } else {
    opacity = opacity_;
  }
  st.opacity = opacity < 1 ? "" + opacity : "";
  if (opacity !== opacity_) { return; }
  if (opacity === 0) {
    st.visibility = "hidden";
    $text.data = "";
  }
  clearInterval(tweenId);
  tweenId = 0;
}

export const hudHide = (info?: TimerType): void => {
  let i: number;
  if (i = timer) { clearTimeout_(i); timer = TimerID.None; }
  opacity_ = 0; text = "";
  if (!box) { /* empty */ }
  else if (info === TimerType.noTimer || !isEnabled_) {
    st.opacity = "0";
    st.visibility = "hidden";
    $text.data = "";
  }
  else if (!tweenId && isAlive_) {
    tweenId = interval_(tween, 40);
  }
}
