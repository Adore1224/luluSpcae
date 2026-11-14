import { lazy, Suspense, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import BrickCharacter from './BrickCharacter';
import { HangingBadge } from './Hero';
import PersonalCapsule from './PersonalCapsule';

const PhotoWall = lazy(() => import('./LabPhotoWall'));

export default function LabAbout() {
  const [activeItem, setActiveItem] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [photosOpen, setPhotosOpen] = useState(false);

  return <main id="main-content" className="lab-page lab-about">
    <header className="lab-page-heading">
      <p className="lab-kicker"><span />PORTRAIT / LULU</p>
      <h1>关于<i>.</i></h1>
      <p>这里留给工作之外的我，当然如你有任何需要或者疑难问题欢迎联系：
        <span className="lab-about-contacts">
          <span className="lab-about-contact">邮箱：<a href="mailto:xiaowpc1224@gmail.com">xiaowpc1224@gmail.com</a></span>
          {' '}
          <span className="lab-about-contact">或 微信：<strong>xiaow_0012</strong></span>
        </span>
      </p>
    </header>
    <div className="lab-about-layout">
      <section className="lab-badge-area" aria-label="Lulu 的个人工牌">
        <HangingBadge flipped={flipped} onFlippedChange={setFlipped} />
      </section>
      <section className="lab-about-station" id="about-capsule" aria-label="Lulu 形象枢纽">
        <div className="lab-about-capsule"><PersonalCapsule activeItem={activeItem} onSelectItem={setActiveItem} /></div>
        <div className="lab-about-character"><BrickCharacter activeItem={activeItem} /></div>
      </section>
    </div>
    <section className="lab-about-section" id="about-photos" aria-labelledby="about-photos-title">
      <h2 id="about-photos-title">
        <button className="lab-photo-toggle" type="button" aria-expanded={photosOpen} aria-controls="about-photo-gallery" onClick={() => setPhotosOpen((open) => !open)}>
          <span><span className="lab-kicker">PHOTO ARCHIVE</span>随手一拍</span>
          <span className="lab-photo-toggle-action">{photosOpen ? '收起照片' : '展开照片'} <ChevronDown size={18} aria-hidden="true" /></span>
        </button>
      </h2>
      <div id="about-photo-gallery" hidden={!photosOpen}>
        {photosOpen && <Suspense fallback={<p role="status">正在加载照片…</p>}><PhotoWall /></Suspense>}
      </div>
    </section>
  </main>;
}
