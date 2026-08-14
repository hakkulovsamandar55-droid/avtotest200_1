import React, { useEffect, useRef, useCallback } from "react";

// Barmoq bilan chapga/o'ngga surilganda bo'limlar orasida (Bosh/Statistika/
// Sozlamalar) o'tish uchun. Uchala bo'lim doim DOM'da yonma-yon turadi
// (translateX bilan suriladi) — shu sababli surish paytida "qotib qolish"
// yoki qayta yuklanish bo'lmaydi, faqat silliq transform animatsiyasi.
const SWIPE_RATIO = 0.22; // konteyner kengligining shuncha qismidan ko'p surilsa keyingi bo'limga o'tadi
const FLICK_VELOCITY = 0.55; // px/ms — tez "urib" suriganda kam masofada ham o'tkazadi
const EASE = "transform 0.32s cubic-bezier(0.16,1,0.3,1)";

// Ichkarida o'zining gorizontal skrolli bo'lgan elementni (masalan Chip
// qatorlari, overflow-x-auto) topadi — bosilgan joydan `root`gacha yuqoriga
// qarab yuradi. Topilsa, bo'lim almashtirish gesture'i shu elementga
// "yo'l bo'shatadi", aks holda ichki qator hech qachon o'zi suril olmasdi
// (tashqi TabSwiper har doim uni bosib o'tardi).
function findHorizontalScroller(el, root) {
  let node = el;
  while (node && node !== root) {
    if (node.scrollWidth > node.clientWidth + 1) {
      const style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowX)) return node;
    }
    node = node.parentElement;
  }
  return null;
}

export default function TabSwiper({ tabs, active, onChange, children }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const state = useRef({ tracking: false, axis: null, startX: 0, startY: 0, lastX: 0, lastT: 0 });

  const indexOf = useCallback((key) => Math.max(0, tabs.indexOf(key)), [tabs]);

  const setTransform = useCallback((px, animate) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transition = animate ? EASE : "none";
    el.style.transform = `translate3d(${px}px,0,0)`;
  }, []);

  const snapTo = useCallback(
    (index) => {
      const clamped = Math.max(0, Math.min(tabs.length - 1, index));
      const width = containerRef.current?.offsetWidth || 0;
      setTransform(-clamped * width, true);
      if (tabs[clamped] !== active) onChange(tabs[clamped]);
    },
    [tabs, active, onChange, setTransform]
  );

  // Tashqaridan (pastki navigatsiya tugmasi) faol bo'lim o'zgarsa ham
  // xuddi shu silliq animatsiya bilan sinxronlaymiz.
  useEffect(() => {
    const width = containerRef.current?.offsetWidth || 0;
    setTransform(-indexOf(active) * width, true);
  }, [active, indexOf, setTransform]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      state.current = {
        tracking: true,
        axis: null,
        startX: t.clientX,
        startY: t.clientY,
        lastX: t.clientX,
        lastT: Date.now(),
        startTarget: e.target,
      };
    }

    function onTouchMove(e) {
      const s = state.current;
      if (!s.tracking) return;
      const t = e.touches[0];
      const dx = t.clientX - s.startX;
      const dy = t.clientY - s.startY;

      if (s.axis === null) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        s.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";

        if (s.axis === "x") {
          const scroller = findHorizontalScroller(s.startTarget, container);
          if (scroller) {
            const atLeftEdge = scroller.scrollLeft <= 0;
            const atRightEdge = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1;
            const draggingTowardRight = dx < 0; // qatorning o'ng tomonini ochadi
            if ((draggingTowardRight && !atRightEdge) || (!draggingTowardRight && !atLeftEdge)) {
              s.axis = "innerScroll"; // ichki qator hali suriladigan joyi bor — unga bo'shatib beramiz
            }
          }
        }
      }
      if (s.axis !== "x") return; // vertikal scroll yoki ichki gorizontal skroll — brauzerning o'ziga qoldiramiz

      e.preventDefault();
      s.lastX = t.clientX;
      s.lastT = Date.now();

      const width = container.offsetWidth || 1;
      const base = -indexOf(active) * width;
      let next = base + dx;
      const min = -(tabs.length - 1) * width;
      // Chekka bo'limlarda "elastik" qarshilik — chetdan tashqariga sekinroq suriladi
      if (next > 0) next = next * 0.35;
      if (next < min) next = min + (next - min) * 0.35;
      setTransform(next, false);
    }

    function onTouchEnd() {
      const s = state.current;
      if (!s.tracking) return;
      s.tracking = false;
      if (s.axis !== "x") return;

      const width = container.offsetWidth || 1;
      const dx = s.lastX - s.startX;
      const dt = Math.max(1, Date.now() - s.lastT);
      const velocity = dx / dt;
      let targetIndex = indexOf(active);
      if (Math.abs(dx) > width * SWIPE_RATIO || Math.abs(velocity) > FLICK_VELOCITY) {
        targetIndex += dx < 0 ? 1 : -1;
      }
      snapTo(targetIndex);
    }

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, tabs, indexOf, setTransform, snapTo]);

  const list = React.Children.toArray(children);

  return (
    <div ref={containerRef} className="relative flex-1 min-h-0 overflow-hidden" style={{ touchAction: "pan-y" }}>
      <div ref={trackRef} className="flex h-full">
        {list.map((child, i) => (
          <div key={tabs[i] || i} className="h-full shrink-0 flex flex-col overflow-hidden" style={{ flex: "0 0 100%" }}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
