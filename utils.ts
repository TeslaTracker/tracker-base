export function shouldScrape(url: string, baseDomain: string): boolean {
  let domain = new URL(baseDomain);

  // test xx_xx for sub lang domains
  const langRegex = new RegExp(`${domain.hostname}/[a-z][a-z]_[a-z][a-z]`);
  if (langRegex.test(url)) {
    return false;
  }

  const cnRegex = new RegExp(`${domain.hostname}`);
  if (!cnRegex.test(url)) {
    return false;
  }

  return true;
}

export function cleanupFile(content: string): string {
  // replace favicon_1.png with favicon.png
  const duplicatedFileRegex = new RegExp(`_[0-9].`, 'gm');
  content = content.replace(duplicatedFileRegex, '.');

  // remove the nonce parameter from the script tags
  const nonceRegex = new RegExp(` nonce="(.)*?"`, 'gm');
  content = content.replace(nonceRegex, '');

  return content;
}
