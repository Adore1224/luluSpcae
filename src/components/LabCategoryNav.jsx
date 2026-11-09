import { useEffect, useRef } from 'react';

export default function LabCategoryNav({ label, caption, items, value, onChange }) {
  const nav = useRef(null);

  useEffect(() => {
    const list = nav.current;
    const active = list.querySelector('[aria-current="page"], [aria-pressed="true"]');
    if (active && list.scrollWidth > list.clientWidth) {
      list.scrollLeft = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
    }
  }, [value]);

  return <aside className="lab-category-rail">
    <p className="lab-kicker">{caption}</p>
    <nav ref={nav} aria-label={label}>{items.map((item, index) => {
      const selected = value === item.id;
      const Item = item.href ? 'a' : 'button';
      const attributes = item.href
        ? { href: item.href, 'aria-current': selected ? 'page' : undefined }
        : { type: 'button', 'aria-pressed': selected };
      return <Item key={item.id} {...attributes} onClick={(event) => onChange(item.id, event)}>
        <span className="lab-category-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span><strong>{item.label}</strong>{item.detail && <small>{item.detail}</small>}</span>
      </Item>;
    })}</nav>
  </aside>;
}
