import { storyView } from './story.js';
import { gapsView } from './gaps.js';
import { monthlyView } from './monthly.js';
import { printableView } from './printable.js';
export const reportsView = (m, sub, rerender) => ({ story: storyView, gaps: gapsView, monthly: monthlyView, print: printableView }[sub] || storyView)(m, rerender);
