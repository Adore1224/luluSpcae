import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { pictureGallery } from '../data/photoGallery';
import LabImageViewer from './LabImageViewer';

export default function LabPhotoWall() {
  const [activePhoto, setActivePhoto] = useState(null);
  return <>
    {pictureGallery.length ? <div className="lab-photo-wall">{pictureGallery.map((photo) => <button type="button" key={photo.id} aria-label={`查看${photo.displayName}`} aria-haspopup="dialog" onClick={() => setActivePhoto(photo)}>
      <img src={photo.thumbnail} alt="" loading="lazy" decoding="async" /><span>{photo.displayName}<Maximize2 size={14} /></span>
    </button>)}</div> : <p>还没有照片。</p>}
    {activePhoto && <LabImageViewer src={activePhoto.thumbnail} alt={activePhoto.displayName} onDismiss={() => setActivePhoto(null)} />}
  </>;
}
