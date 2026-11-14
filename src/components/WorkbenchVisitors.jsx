import { useEffect, useId, useState } from 'react';
import { Users } from 'lucide-react';
import { api } from '../data/labApi';

const number = new Intl.NumberFormat('zh-CN');

export default function WorkbenchVisitors() {
  const heading = useId();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const refresh = () => {
      api('/api/workbench/visitors', { signal: controller.signal }).then((data) => {
        if (!controller.signal.aborted) setStats(data);
      }).catch(() => {
        if (!controller.signal.aborted) setStats({ unavailable: true });
      });
    };
    refresh();
    const timer = setInterval(() => { if (!document.hidden) refresh(); }, 60_000);
    return () => { clearInterval(timer); controller.abort(); };
  }, []);

  return <section className="desk-visitors" aria-labelledby={heading}>
    <h2 id={heading}><Users size={17} aria-hidden="true" />访客统计</h2>
    {!stats || stats.unavailable ? <p role="status">{stats ? '暂时无法读取统计' : '正在读取…'}</p> : <>
      <dl>
        <div><dt>累计访客</dt><dd>{number.format(stats.total)}</dd></div>
        <div><dt>今日</dt><dd>{number.format(stats.today)}</dd></div>
        <div><dt>近 7 天</dt><dd>{number.format(stats.recent)}</dd></div>
      </dl>
      <p>按浏览器去重</p>
    </>}
  </section>;
}
