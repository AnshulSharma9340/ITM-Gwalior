/*
 * Registry of public pages, used by the admin edit bar's "switch page" picker.
 * Grouped to keep the dropdown scannable. Paths must match the routes in App.jsx.
 */
export const SITE_PAGES = [
  {
    group: 'Main',
    pages: [
      { label: 'Home', path: '/' },
      { label: 'Training & Placement', path: '/tap' },
      { label: 'Contact', path: '/contact' },
    ],
  },
  {
    group: 'About',
    pages: [
      { label: 'About Institute', path: '/about' },
      { label: 'Mission & Vision', path: '/about/mission-vision' },
      { label: 'ITM Officials', path: '/about/officials' },
      { label: 'Board of Governors', path: '/about/board-of-governors' },
      { label: "Director's Message", path: '/about/director-message' },
      { label: 'Programmes Offered', path: '/about/programmes' },
      { label: 'Infrastructure', path: '/about/infrastructure' },
      { label: 'Best Practices', path: '/about/best-practices' },
      { label: 'Distinctiveness', path: '/about/distinctiveness' },
      { label: 'Policies & Reports', path: '/about/policies' },
      { label: 'Student Magazine', path: '/about/magazine' },
      { label: 'What Gwalior Offers', path: '/about/gwalior' },
    ],
  },
  {
    group: 'Admissions',
    pages: [
      { label: 'Admissions Overview', path: '/admissions' },
      { label: 'UG Courses', path: '/admissions/ug' },
      { label: 'PG Courses', path: '/admissions/pg' },
      { label: 'How to Seek Admission', path: '/admissions/how-to-apply' },
    ],
  },
  {
    group: 'Departments',
    pages: [
      { label: 'CS Engineering', path: '/cs' },
      { label: 'Information Technology', path: '/it' },
      { label: 'Electronics & Communication', path: '/ece' },
      { label: 'Mechanical Engineering', path: '/me' },
      { label: 'Civil Engineering', path: '/ce' },
      { label: 'MBA · Management', path: '/mba' },
      { label: 'Engineering Sciences & Humanities', path: '/esh' },
      { label: 'Emerging Branches', path: '/emerging-branches' },
      { label: 'AI & ML', path: '/aiml' },
      { label: 'Cyber Security', path: '/cyber-security' },
      { label: 'Cloud Computing', path: '/cloud-computing' },
      { label: 'Central Library', path: '/library' },
    ],
  },
  {
    group: 'Research',
    pages: [
      { label: 'Research Overview', path: '/research' },
      { label: 'R&D Cell', path: '/research/rd-cell' },
      { label: 'Innovation Ecosystem', path: '/research/innovation-ecosystem' },
      { label: 'International Journal', path: '/research/journal' },
      { label: 'International Conference', path: '/research/conference' },
      { label: 'Faculty Development Program', path: '/research/fdp' },
    ],
  },
  {
    group: 'Campus Life',
    pages: [
      { label: 'Performing Arts Club (PAC)', path: '/pac' },
      { label: 'Other Clubs', path: '/clubs' },
      { label: 'UBA Cell', path: '/cells/uba' },
      { label: 'NSS Cell', path: '/cells/nss' },
      { label: 'Sports Cell', path: '/cells/sports' },
      { label: 'Women Empowerment Cell', path: '/cells/wec' },
    ],
  },
  {
    group: 'Alumni',
    pages: [
      { label: 'Mentorship Program', path: '/alumni/mentorship' },
      { label: 'Life Membership', path: '/alumni/membership' },
      { label: 'Alumni Chapters', path: '/alumni/chapters' },
      { label: 'Alumni Speaks', path: '/alumni/speaks' },
    ],
  },
  {
    group: 'Compliance & More',
    pages: [
      { label: 'NAAC Policies', path: '/naac' },
      { label: 'IQAC', path: '/iqac' },
      { label: 'Committees', path: '/committees' },
      { label: 'MOUs & Collaborations', path: '/mous' },
      { label: 'Appreciation', path: '/appreciation' },
      { label: 'NIRF Ranking', path: '/nirf' },
      { label: 'Anti-Ragging', path: '/anti-ragging' },
      { label: 'Careers', path: '/careers' },
      { label: 'Junior Research Fellow', path: '/jrf' },
    ],
  },
  {
    group: 'Gallery',
    pages: [
      { label: 'Gallery Hub', path: '/gallery' },
      { label: 'Cultural', path: '/gallery/cultural' },
      { label: 'Experts', path: '/gallery/experts' },
      { label: 'Infrastructure', path: '/gallery/infrastructure' },
      { label: 'Sports', path: '/gallery/sports' },
      { label: 'Students', path: '/gallery/students' },
      { label: 'Life at ITM', path: '/gallery/life' },
      { label: 'Videos', path: '/gallery/videos' },
    ],
  },
];

// Flat lookup helper — returns the label for a given path, if known.
export function pageLabelForPath(path) {
  for (const { pages } of SITE_PAGES) {
    const hit = pages.find((p) => p.path === path);
    if (hit) return hit.label;
  }
  return path;
}
