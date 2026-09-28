/**
 * Strict URL and Domain Validators for Siteon Platform
 * Enforces authentic GitHub repositories, authentic LinkedIn profiles,
 * and valid live deployments while preventing link swaps or invalid domains.
 */

// GitHub Repository: https://github.com/username/repository
const GITHUB_REPO_REGEX = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(\/.*)?$/;

// GitHub Profile or Repo: https://github.com/username
const GITHUB_PROFILE_REGEX = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9_.-]+)(\/.*)?$/;

// LinkedIn Profile: https://linkedin.com/in/username or https://www.linkedin.com/in/username
const LINKEDIN_PROFILE_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/(in|company|school)\/([a-zA-Z0-9_.-]+)(\/.*)?$/;

export function validateGithubRepoUrl(input) {
  const url = (input || '').trim();
  if (!url) {
    return { isValid: false, error: 'GitHub repository URL is mandatory.' };
  }

  // Check if user accidentally pasted LinkedIn
  if (/linkedin\.com/i.test(url)) {
    return {
      isValid: false,
      error: 'You entered a LinkedIn URL in the GitHub repository field. Please enter a valid GitHub repository URL (e.g. https://github.com/username/project).'
    };
  }

  // Check if non-github domain
  if (!/^(https?:\/\/)?(www\.)?github\.com/i.test(url)) {
    return {
      isValid: false,
      error: 'Invalid domain. Only GitHub repository links (https://github.com/username/project) are allowed here.'
    };
  }

  // Check full repo pattern
  const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
  const match = formattedUrl.match(GITHUB_REPO_REGEX);
  if (!match) {
    return {
      isValid: false,
      error: 'Please provide a direct repository URL including both username and repo name (e.g. https://github.com/your-username/your-repo).'
    };
  }

  const repoOwner = match[2];
  const repoName = match[3];
  if (!repoOwner || !repoName || ['search', 'explore', 'settings', 'notifications', 'marketplace'].includes(repoOwner.toLowerCase())) {
    return {
      isValid: false,
      error: 'Please provide a valid GitHub project repository link.'
    };
  }

  return { isValid: true, error: null, normalized: formattedUrl };
}

export function validateGithubProfileUrl(input) {
  const url = (input || '').trim();
  if (!url) {
    return { isValid: false, error: 'GitHub profile URL is mandatory.' };
  }

  if (/linkedin\.com/i.test(url)) {
    return {
      isValid: false,
      error: 'You entered a LinkedIn URL in the GitHub field. Please enter your GitHub profile link (e.g. https://github.com/yourusername).'
    };
  }

  if (!/^(https?:\/\/)?(www\.)?github\.com/i.test(url)) {
    return {
      isValid: false,
      error: 'Invalid domain. Only GitHub links (https://github.com/yourusername) are allowed.'
    };
  }

  const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
  const match = formattedUrl.match(GITHUB_PROFILE_REGEX);
  if (!match || !match[2]) {
    return {
      isValid: false,
      error: 'Please enter a valid GitHub profile URL (e.g. https://github.com/yourusername).'
    };
  }

  return { isValid: true, error: null, normalized: formattedUrl };
}

export function validateLinkedinUrl(input) {
  const url = (input || '').trim();
  if (!url) {
    return { isValid: false, error: 'LinkedIn profile URL is mandatory.' };
  }

  // Check if user accidentally pasted GitHub
  if (/github\.com/i.test(url)) {
    return {
      isValid: false,
      error: 'You entered a GitHub URL in the LinkedIn field. Please enter your LinkedIn profile URL (e.g. https://linkedin.com/in/yourname).'
    };
  }

  // Check domain
  if (!/^(https?:\/\/)?(www\.)?linkedin\.com/i.test(url)) {
    return {
      isValid: false,
      error: 'Invalid domain. Only LinkedIn profile links (https://linkedin.com/in/yourname) are allowed.'
    };
  }

  const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
  const match = formattedUrl.match(LINKEDIN_PROFILE_REGEX);
  if (!match) {
    return {
      isValid: false,
      error: 'Please provide a valid LinkedIn profile URL (e.g. https://linkedin.com/in/your-name).'
    };
  }

  return { isValid: true, error: null, normalized: formattedUrl };
}

export function validateLiveUrl(input) {
  const url = (input || '').trim();
  if (!url) {
    return { isValid: false, error: 'Live deployment URL is mandatory.' };
  }

  if (/github\.com/i.test(url)) {
    return {
      isValid: false,
      error: 'Live deployment URL cannot be a GitHub repository. Please enter the hosted project website (e.g. https://your-app.vercel.app).'
    };
  }

  if (/linkedin\.com/i.test(url)) {
    return {
      isValid: false,
      error: 'Live deployment URL cannot be a LinkedIn profile.'
    };
  }

  try {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    const parsed = new URL(formattedUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error();
    }
    if (!parsed.hostname.includes('.')) {
      throw new Error();
    }
    return { isValid: true, error: null, normalized: formattedUrl };
  } catch {
    return {
      isValid: false,
      error: 'Enter a valid live deployment URL (e.g. https://your-project.vercel.app).'
    };
  }
}

export function validateResumeUrl(input) {
  const url = (input || '').trim();
  if (!url) {
    return { isValid: false, error: 'Resume link is mandatory.' };
  }

  if (/github\.com/i.test(url) || /linkedin\.com/i.test(url)) {
    return {
      isValid: false,
      error: 'Resume link should be a cloud document or PDF link (e.g. Google Drive, Dropbox, OneDrive), not a GitHub or LinkedIn profile.'
    };
  }

  try {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    const parsed = new URL(formattedUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error();
    }
    return { isValid: true, error: null, normalized: formattedUrl };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL for your resume document.'
    };
  }
}
