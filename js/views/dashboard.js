import { h } from '../ui/dom.js';
import * as S from '../core/storage.js';
import { MODULES } from '../core/modules.js';
import { timelineEntries, today, byDateDesc } from '../core/records.js';
import { latestBySkill } from './skills.js';
import { fmtDate } from '../ui/dom.js';

const demo = r => (r.isDemo ? h('span', { class: 'badge' }, 'DEMO') : null);
const widget = (title, rows, href, empty) => h('section', { class: 'card' }, h('h2', {}, title),
  rows.length ? h('ul', { class: 'plain' }, rows.map(r => h('li', {}, h('a', { href: r.href }, r.label, demo(r.rec || {}))))) : h('p', { class: 'muted' }, empty),
  href ? h('a', { href }, 'See all') : null);
const recent = (coll, mod, n = 3) => S.read(coll).sort(byDateDesc('date')).slice(0, n).map(r => ({ rec: r, label: r.title || '(untitled)', href: `#/${mod}/view/${r.id}` }));

export function dashboard() {
  const m = MODULES[0], stu = S.read('student')[0], goals = S.read('goals');
  const current = goals.filter(g => ['Exploring', 'Planning', 'In Progress'].includes(g.status)).slice(0, 5).map(g => ({ rec: g, label: g.title + (g.status ? ` (${g.status})` : ''), href: `#/goals/view/${g.id}` }));
  const upcoming = goals.filter(g => g.deadline && g.deadline >= today() && g.status !== 'Completed').sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 5)
    .map(g => ({ rec: g, label: `${fmtDate(g.deadline)}: ${g.title}`, href: `#/goals/view/${g.id}` }));
  const dev = Object.values(latestBySkill(S.read('skills'))).filter(r => ['Emerging', 'Developing'].includes(r.level)).map(r => ({ rec: r, label: `${r.skill} (${r.level})`, href: '#/skills' }));
  const tl = timelineEntries().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(e => ({ rec: { isDemo: e.isDemo }, label: `${fmtDate(e.date)}: ${e.title}`, href: e.href }));
  const tiles = MODULES.filter(x => x.collection && x.collection !== 'student' && x.id !== 'sst').map(x => {
    const n = S.read(x.collection).filter(r => !r.isDemo).length;
    return h('a', { class: 'card tile g-' + x.grad, href: '#/' + x.id + (x.subs ? '/' + x.subs[0].id : '') }, h('span', { class: 'tile-n' }, String(n)), h('span', {}, x.label), h('small', {}, n === 1 ? 'record' : 'records'));
  });
  return h('div', { class: 'page' },
    h('header', { class: 'hero g-dashboard' }, h('h1', { tabindex: '-1', id: 'pageTitle' }, "Welcome to Cyllee's STEM Journey"), h('p', {}, 'Explore • Build • Solve • Create')),
    h('section', { class: 'card' }, h('h2', {}, 'Profile'),
      stu ? h('div', { class: 'prof' }, stu.photo ? h('img', { class: 'avatar', src: stu.photo, alt: '' }) : null,
        h('div', {}, h('p', {}, h('strong', {}, stu.name || 'Name not set'), stu.isDemo ? h('span', { class: 'badge' }, 'DEMO') : null),
          h('p', { class: 'muted' }, [stu.age && 'Age ' + stu.age, stu.school, stu.level].filter(Boolean).join(', ')), h('a', { href: '#/profile' }, 'Edit profile'))) : h('p', {}, 'No profile yet.')),
    h('section', { class: 'card' }, h('h2', {}, 'Quick actions'), h('div', { class: 'row' },
      [['achievements', 'Achievement'], ['projects', 'Project'], ['goals', 'Goal'], ['reflections', 'Reflection'], ['challenges', 'STEM Challenge']].map(([id, l]) => h('a', { class: 'btn', href: `#/${id}/add` }, '+ Add ' + l)))),
    h('div', { class: 'grid wide' },
      widget('Current goals', current, '#/goals/short', 'No goals in progress yet.'), widget('Upcoming targets', upcoming, '#/goals/short', 'No upcoming deadlines.'),
      widget('Recent achievements', recent('achievements', 'achievements'), '#/achievements/all', 'None yet.'), widget('Recent projects', recent('projects', 'projects'), '#/projects/all', 'None yet.'),
      widget('Robotics activities', recent('robotics', 'robotics'), '#/robotics/log', 'None yet.'), widget('Coding activities', recent('coding', 'coding'), '#/coding/journal', 'None yet.'),
      widget('Science investigations', recent('science', 'science'), '#/science/all', 'None yet.'), widget('Skills being developed', dev, '#/skills', 'No skills marked Emerging or Developing yet.'),
      widget('Recent reflections', recent('reflections', 'reflections'), '#/reflections/all', 'None yet.'), widget('Development timeline', tl, '#/timeline', 'Fills in as records are added.')),
    h('h2', { class: 'sec' }, 'Records so far (your own, demo excluded)'), h('div', { class: 'grid' }, tiles));
}
