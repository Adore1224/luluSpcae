import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function LabImageViewer({ src, alt, onDismiss }) {
  const dialog = useRef(null);

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  function close() {
    dialog.current.close();
    onDismiss();
  }

  return <dialog ref={dialog} className="lab-image-viewer" aria-label="图片预览"
    onCancel={(event) => { event.preventDefault(); close(); }}
    onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    <img src={src} alt={alt} />
    <button className="lab-image-viewer-close" type="button" onClick={close}><X size={21} aria-hidden="true" />关闭</button>
  </dialog>;
}
