/**
 * Generate safe, reliable SVG avatar data URI locally without network dependency
 */
export function getInitialsAvatar(nameOrEmail, size = 120) {
  const clean = (nameOrEmail || 'User').trim();
  let initials = 'U';
  
  if (clean.includes('@')) {
    initials = clean.charAt(0).toUpperCase();
  } else {
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 0) {
      initials = parts[0].substring(0, 2).toUpperCase();
    }
  }

  // Consistent color generation based on string hash
  const colors = [
    ['#2563EB', '#1D4ED8'], // Blue
    ['#4F46E5', '#4338CA'], // Indigo
    ['#0891B2', '#0E7490'], // Cyan
    ['#0D9488', '#0F766E'], // Teal
    ['#059669', '#047857'], // Emerald
    ['#7C3AED', '#6D28D9'], // Violet
    ['#DB2777', '#BE185D'], // Pink
    ['#EA580C', '#C2410C']  // Orange
  ];
  
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const [bg1, bg2] = colors[colorIndex];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}" />
        <stop offset="100%" stop-color="${bg2}" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#grad)" />
    <text x="50" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Filter out hardcoded/leaked git_aura / gitaura names and fallback to clean email prefix
 */
export function isGitAura(val) {
  if (!val || typeof val !== 'string') return false;
  return val.toLowerCase().replace(/[^a-z0-9]/g, '').includes('gitaura');
}

export function cleanDisplayName(name, email = '') {
  if (!name || typeof name !== 'string' || isGitAura(name)) {
    return email ? email.split('@')[0] : '';
  }
  return name.trim();
}
