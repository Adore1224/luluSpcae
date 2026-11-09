import { useEffect, useId, useRef } from 'react';
import { ArrowUpRight, X } from 'lucide-react';

export function DeskDialog({ title, eyebrow, className = '', onDismiss, busy = false, children }) {
  const dialog = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  return <dialog ref={dialog} className={`desk-dialog ${className}`} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onDismiss(); }}>
    <div className="desk-dialog-head">
      <div>{eyebrow && <p className="desk-eyebrow">{eyebrow}</p>}<h2 id={titleId}>{title}</h2></div>
      <button type="button" className="desk-quiet" disabled={busy} onClick={onDismiss} aria-label="关闭"><X size={20} /></button>
    </div>
    {children}
  </dialog>;
}

export function DeskConfirm({ title, detail, label, action, onDismiss }) {
  return <DeskDialog title={title} eyebrow="LULU LAB / CONFIRM" className="desk-confirm" onDismiss={onDismiss}>
    {detail && <p>{detail}</p>}
    <div className="desk-actions">
      <button type="button" className="desk-quiet" autoFocus onClick={onDismiss}>取消</button>
      <button type="button" className="desk-button" onClick={() => { onDismiss(); action(); }}>{label}</button>
    </div>
  </DeskDialog>;
}

export function ExternalLink({ href, children, className = 'desk-quiet' }) {
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={14} /></a>;
}

export function DeskEmpty({ icon: Icon, children }) {
  return <div className="desk-empty">{Icon && <Icon size={24} />}<p>{children}</p></div>;
}

export function Search({ label, value, onChange }) {
  return <input className="desk-search" aria-label={label} placeholder={label} type="search" value={value} onChange={(event) => onChange(event.target.value)} />;
}
