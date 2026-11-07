import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react';
import { pictureGallery } from '../data/photoGallery';

export default function LabPhotoWall() {
  const dialog = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const active = activeIndex === null ? null : pictureGallery[activeIndex];
  const changePhoto = (step) => setActiveIndex((index) => (index + step + pictureGallery.length) % pictureGallery.length);
  return <>
    {pictureGallery.length ? <div className="lab-photo-wall">{pictureGallery.map((photo, index) => <button type="button" key={photo.id} aria-label={`查看${photo.displayName}`} onClick={() => { setActiveIndex(index); dialog.current.showModal(); }}>
      <img src={photo.thumbnail} alt="" loading="lazy" decoding="async" /><span>{photo.displayName}<Maximize2 size={14} /></span>
    </button>)}</div> : <p>还没有照片。</p>}
    <dialog ref={dialog} className="lab-photo-dialog" aria-label="照片查看器" onClose={() => setActiveIndex(null)} onClick={(event) => { if (event.target === event.currentTarget) dialog.current.close(); }} onKeyDown={(event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); changePhoto(event.key === 'ArrowLeft' ? -1 : 1); }
    }}>
      <div className="lab-photo-dialog-inner">
        <div className="lab-photo-toolbar"><span>{active?.displayName}</span><button type="button" onClick={() => dialog.current.close()} aria-label="关闭照片"><X size={20} /></button></div>
        {active && <img src={active.thumbnail} alt={active.displayName} />}
        <div className="lab-photo-controls"><button type="button" onClick={() => changePhoto(-1)} aria-label="上一张照片"><ArrowLeft size={18} /></button><span aria-live="polite">{activeIndex === null ? '' : `${activeIndex + 1} / ${pictureGallery.length}`}</span><button type="button" onClick={() => changePhoto(1)} aria-label="下一张照片"><ArrowRight size={18} /></button></div>
      </div>
    </dialog>
  </>;
}
