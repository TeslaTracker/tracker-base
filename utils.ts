export function shouldScrape(url: string): boolean {
  // test xx_xx for sub lang domains
  const langRegex = new RegExp('tesla.com/[a-z][a-z]_[a-z][a-z]');
  if (langRegex.test(url)) {
    return false;
  }

  const cnRegex = new RegExp('tesla.com');
  if (!cnRegex.test(url)) {
    return false;
  }

  return true;
}
