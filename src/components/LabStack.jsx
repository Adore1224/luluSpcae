import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { LabFooter } from './LabMotion';

// Modules scroll inside their own surface. The footer is a second, overlaid card.
export default function LabStack({ header, children, enabled = true, home = false, scrollKey }) {
  const [open, setOpen] = useState(false);
  const scroller = useRef(null);
  const deck = useRef(null);
  const previousFocus = useRef(null);
  const openFooter = useCallback(() => {
    if (!enabled) return;
    previousFocus.current = document.activeElement;
    setOpen(true);
  }, [enabled]);
  const closeFooter = useCallback(() => setOpen(false), []);

  useLayoutEffect(() => {
    scroller.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [scrollKey]);

  useEffect(() => {
    if (open) {
      deck.current?.querySelector('button')?.focus({ preventScroll: true });
    } else if (previousFocus.current?.isConnected) {
      previousFocus.current.focus({ preventScroll: true });
      previousFocus.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!enabled) return;
    let budget = 0;
    let lastWheel = 0;
    let lastSwitch = 0;
    let touch = null;
    const canScrollDown = (target) => {
      for (let el = target instanceof Element ? target : null; el && el !== scroller.current?.parentElement; el = el.parentElement) {
        if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight - el.clientHeight - el.scrollTop > 2) return true;
      }
      return false;
    };
    const wheel = (event) => {
      if (event.ctrlKey || event.target.closest?.('input, textarea, select, dialog[open]') || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const direction = open ? -1 : 1;
      if (event.deltaY * direction <= 0 || (!open && canScrollDown(event.target))) { budget = 0; return; }
      event.preventDefault();
      const now = performance.now();
      if (now - lastSwitch < 650) return;
      if (now - lastWheel > 240) budget = 0;
      lastWheel = now;
      budget += Math.abs(event.deltaY) * (event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? innerHeight : 1);
      if (budget >= 85) { budget = 0; lastSwitch = now; if (open) closeFooter(); else openFooter(); }
    };
    const keys = (event) => {
      if (event.target.closest?.('dialog[open]')) return;
      if (open) {
        if (event.key === 'Escape' || event.key === 'PageUp') { event.preventDefault(); closeFooter(); }
        if (event.key === 'Tab') {
          const controls = [...deck.current.querySelectorAll('a[href], button:not(:disabled)')].filter((control) => control.getClientRects().length > 0);
          const first = controls[0], last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      } else if (!event.target.closest?.('input,textarea,select,button,a') && ['PageDown', 'End'].includes(event.key) && !canScrollDown(document.activeElement === document.body ? scroller.current : document.activeElement)) {
        event.preventDefault(); openFooter();
      }
    };
    const touchStart = (event) => {
      touch = null;
      if (event.touches.length !== 1 || event.target.closest?.('input, textarea, select, dialog[open]')) return;
      touch = { x: event.touches[0].clientX, y: event.touches[0].clientY, atEnd: !canScrollDown(event.target) };
    };
    const touchEnd = (event) => {
      if (!touch || !event.changedTouches.length) return;
      const dy = touch.y - event.changedTouches[0].clientY;
      const dx = touch.x - event.changedTouches[0].clientX;
      if (Math.abs(dy) > Math.abs(dx) * 1.3) {
        if (open && dy < -60) closeFooter();
        else if (!open && touch.atEnd && dy > 60) openFooter();
      }
      touch = null;
    };
    const touchCancel = () => { touch = null; };
    document.addEventListener('wheel', wheel, { passive: false });
    document.addEventListener('keydown', keys);
    document.addEventListener('touchstart', touchStart, { passive: true });
    document.addEventListener('touchend', touchEnd, { passive: true });
    document.addEventListener('touchcancel', touchCancel, { passive: true });
    return () => {
      document.removeEventListener('wheel', wheel); document.removeEventListener('keydown', keys);
      document.removeEventListener('touchstart', touchStart); document.removeEventListener('touchend', touchEnd);
      document.removeEventListener('touchcancel', touchCancel);
    };
  }, [open, enabled, openFooter, closeFooter]);

  return <>
    <div className={`lab-surface${open ? ' is-stacked' : ''}`} inert={open} onClick={(event) => {
      if (event.target.closest('a[href="#lab-footer"]')) { event.preventDefault(); openFooter(); }
    }}>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      {header}
      <div className="lab-surface-scroll" ref={scroller} tabIndex={-1}>
        {children}
        {enabled && !home && <div className="lab-stack-invite"><span>END OF THIS PAGE</span><button type="button" onClick={openFooter}>翻到页脚 <ArrowDown size={15} /></button></div>}
      </div>
    </div>
    {enabled && <div ref={deck} className={`lab-footer-deck${open ? ' is-open' : ''}`} inert={!open} aria-hidden={!open} role="dialog" aria-modal={open ? true : undefined} aria-label="站点页脚">
      <LabFooter onClose={closeFooter} />
    </div>}
  </>;
}
