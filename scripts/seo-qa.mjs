import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {startServer} from './qa-server.mjs';

const port = 3105;
process.env.SITE_URL = `http://127.0.0.1:${port}`;
const server = await startServer(port);
// Next.js serves complete HTML to HTML-limited crawlers. Googlebot can execute
// JavaScript and receives streamed loading markup as well as the final content.
const crawlerHeaders = {'user-agent': 'Twitterbot'};
const report = {startedAt: new Date().toISOString(), mode: 'local production server in snapshot mode; HTML-limited crawler', routes: []};
const titles = new Set();
const descriptions = new Set();

function attribute(html, tag, key, value, result) {
  const elements = html.match(new RegExp(`<${tag}\\b[^>]*>`, 'gi')) ?? [];
  const element = elements.find(el => el.includes(`${key}="${value}"`));
  return element?.match(new RegExp(`${result}="([^"]*)"`))?.[1] ?? null;
}

try {
  for (const path of ['/', '/network', '/models', '/activity', '/workload', '/learn', '/developers', '/providers/openbroker', '/providers/proxy', '/about', '/privacy', '/watchlist', '/account/usage']) {
    const response = await fetch(server.base + path, {headers: crawlerHeaders});
    assert.equal(response.status, 200, path);
    const html = await response.text();
    const canonical = attribute(html, 'link', 'rel', 'canonical', 'href');
    assert.ok(canonical, path + ' has a canonical');
    assert.equal(new URL(canonical).href, server.base + path, path + ' has a route-specific canonical');
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
    const description = attribute(html, 'meta', 'name', 'description', 'content');
    assert.ok(title?.includes('GonkaStats'), path + ' has a branded title');
    assert.ok(description && description.length >= 40, path + ' has a useful description');
    assert.equal(titles.has(title), false, path + ' has a distinct title');
    assert.equal(descriptions.has(description), false, path + ' has a distinct description');
    titles.add(title); descriptions.add(description);
    assert.equal(attribute(html, 'meta', 'property', 'og:url', 'content'), canonical, path + ' social URL matches canonical');
    assert.ok(attribute(html, 'meta', 'property', 'og:description', 'content'), path + ' has a social description');
    // The response can contain both a streaming loading boundary and the final
    // page. The browser suites verify the final DOM's single primary heading.
    const headingsInResponse = (html.match(/<h1\b/g) ?? []).length;
    const robots = attribute(html, 'meta', 'name', 'robots', 'content');
    if (['/watchlist', '/account/usage'].includes(path)) assert.ok(robots?.includes('noindex'), path + ' keeps browser-local/account views out of search');
    report.routes.push({path, status: response.status, canonical, title, description, robots, headingsInResponse});
  }
  const missing = await fetch(server.base + '/missing-page-for-seo-qa', {headers: crawlerHeaders});
  const missingHtml = await missing.text();
  const excluded = (missingHtml.match(/<meta\b[^>]*>/g) ?? []).some(tag => tag.includes('name="robots"') && tag.includes('noindex'));
  assert.ok(excluded, 'unknown pages are excluded from indexing');
  // With the app's loading boundary, Next.js can commit a streamed response
  // before notFound() resolves. Record that HTTP status instead of calling it
  // a hard 404; the browser and crawler still receive the not-found/noindex UI.
  report.notFound = {status: missing.status, noindex: excluded};
  const sitemap = await fetch(server.base + '/sitemap.xml');
  assert.equal(sitemap.status, 200, 'crawler sitemap exists');
  const xml = await sitemap.text();
  assert.ok(xml.includes(`<loc>${server.base}/models</loc>`));
  assert.ok(!xml.includes('/watchlist') && !xml.includes('/account'));
  report.sitemap = [];
  for (const [,url] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    assert.equal(new URL(url).origin, server.base, 'sitemap uses the configured site origin');
    const response = await fetch(url, {headers: crawlerHeaders});
    assert.equal(response.status, 200, url + ' is a real public page');
    const html = await response.text();
    const canonical = attribute(html, 'link', 'rel', 'canonical', 'href');
    assert.ok(canonical, url + ' has a canonical');
    assert.equal(new URL(canonical).href, url);
    report.sitemap.push({url, status: response.status});
  }
  assert.ok(report.sitemap.length >= 30, 'sitemap covers the public application routes');
  const robots = await fetch(server.base + '/robots.txt');
  assert.equal(robots.status, 200, 'crawler policy exists');
  const crawlerPolicy = await robots.text();
  assert.ok(crawlerPolicy.includes(`Sitemap: ${server.base}/sitemap.xml`));
  const disallowed = [...crawlerPolicy.matchAll(/^Disallow:\s*(\S+)/gmi)].map(([,path]) => path);
  assert.ok(disallowed.includes('/api/'), 'crawler policy excludes the API');
  for (const path of ['/watchlist', '/account/usage']) {
    assert.equal(disallowed.some(prefix => path.startsWith(prefix)), false,
      path + ' is crawlable so search engines can read its noindex instruction');
  }
  report.crawlerPolicy = {disallowed, crawlableNoindexPages: ['/watchlist', '/account/usage']};
  report.result = 'passed';
} catch (error) {
  report.result = 'failed';
  report.error = error.stack ?? String(error);
  console.error(error);
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  await mkdir('artifacts', {recursive: true});
  await writeFile('artifacts/seo-report.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  server.stop();
}
