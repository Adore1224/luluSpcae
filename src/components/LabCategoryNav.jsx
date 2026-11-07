export default function LabCategoryNav({ label, caption, items, value, onChange }) {
  return <aside className="lab-category-rail">
    <p className="lab-kicker">{caption}</p>
    <nav aria-label={label}>{items.map((item, index) => <button key={item.id} type="button" aria-pressed={value === item.id} onClick={() => onChange(item.id)}>
      <span className="lab-category-index">{String(index + 1).padStart(2, '0')}</span><span><strong>{item.label}</strong>{item.detail && <small>{item.detail}</small>}</span>{item.count !== undefined && <i>{item.count}</i>}
    </button>)}</nav>
  </aside>;
}
