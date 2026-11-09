import { useState } from 'react';
import { ArrowRight, Images } from 'lucide-react';
import { projectShowcases } from '../data/projectShowcases';
import LabImageViewer from './LabImageViewer';

function ProjectFeatures({ features }) {
  return <section className="lab-project-features" aria-labelledby="lab-project-features-title">
    <p className="lab-kicker">FEATURES</p>
    <h3 id="lab-project-features-title">功能清单</h3>
    <div className="lab-project-feature-groups">
      {features.map(([group, items]) => <div key={group}>
        <h4>{group}</h4>
        <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>)}
    </div>
  </section>;
}

function ProjectFlow({ flowTitle, steps }) {
  const [active, setActive] = useState(0);
  return <section className="lab-project-flow" aria-label={flowTitle}>
    <p className="lab-kicker">WORKFLOW</p>
    <h3>{flowTitle}</h3>
    <ol className="lab-flow-steps" style={{ '--flow-steps': steps.length }}>
      {steps.map(([title], index) => <li key={title}>
        <button type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
          <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><strong>{title}</strong>
        </button>
        {index < steps.length - 1 && <ArrowRight className="lab-flow-arrow" size={16} aria-hidden="true" />}
      </li>)}
    </ol>
    <div className="lab-flow-detail" aria-live="polite"><p key={active}>{steps[active][1]}</p></div>
  </section>;
}

function ProjectGallery({ pictures }) {
  const [index, setIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const picture = pictures[index] ?? pictures[0];
  return <section className="lab-gallery" aria-labelledby="lab-gallery-title">
    <header className="lab-gallery-heading"><Images size={19} aria-hidden="true" /><h3 id="lab-gallery-title">部分内容截图</h3><span>{pictures.length} 张</span></header>
    <figure><button type="button" className="lab-image-trigger" aria-label="放大查看截图" aria-haspopup="dialog" onClick={() => setPreviewOpen(true)}><img src={picture.image} alt={picture.description} loading="lazy" /></button>
      <figcaption><span>{String(index + 1).padStart(2, '0')} / {String(pictures.length).padStart(2, '0')}</span>{picture.description}</figcaption>
    </figure>
    {pictures.length > 1 && <div className="lab-thumbnails">{pictures.map((shot, i) => <button type="button" key={`${shot.image}-${i}`} aria-pressed={index === i} aria-label={`查看截图 ${i + 1}`} onClick={() => setIndex(i)}><img src={shot.image} alt="" loading="lazy" /></button>)}</div>}
    {previewOpen && <LabImageViewer src={picture.image} alt={picture.description} onDismiss={() => setPreviewOpen(false)} />}
  </section>;
}

export default function LabProjectShowcase({ project }) {
  const showcase = Object.hasOwn(projectShowcases, project.id) ? projectShowcases[project.id] : null;
  return <>
    {showcase && <>
      <ProjectFeatures features={showcase.features} />
      <ProjectFlow {...showcase} />
      <section className="lab-project-architecture" aria-label="技术结构">
        <div><p className="lab-kicker">SYSTEM OVERVIEW</p><h3>技术结构</h3></div>
        <dl>{showcase.stack.map(([area, tools]) => <div key={area}><dt>{area}</dt><dd>{tools}</dd></div>)}</dl>
      </section>
    </>}
    {!project.hideGallery && project.gallery?.length > 0 && <ProjectGallery pictures={project.gallery} />}
  </>;
}
