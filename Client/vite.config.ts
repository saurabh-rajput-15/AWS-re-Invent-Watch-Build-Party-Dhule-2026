import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import {defineConfig, type Plugin} from 'vite';

const BASE_URL = 'https://reinvent.awssbgdhule.in';

interface StaticRouteSeoConfig {
  route: string;
  title: string;
  itemName: string;
  description: string;
  breadcrumbName: string;
  noscriptHtml: string;
}

const STATIC_ROUTES: StaticRouteSeoConfig[] = [
  {
    route: 'register',
    title: 'Register for Pass · AWS re:Invent Watch & Build Party Dhule 2026',
    itemName: 'Register for Free Pass · AWS re:Invent Dhule 2026',
    description:
      'Register for a free verified community pass for AWS re:Invent Watch & Build Party Dhule 2026. Free entry includes keynote screenings, Kubernetes masterclass, buffet lunch, and official AWS swag at Hotel Anand Regency Riverfront on 04 December 2026.',
    breadcrumbName: 'Register for Free Pass',
    noscriptHtml: `<article id="seo-crawl-shell" style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #F3F4F6;">
        <header>
          <p style="color: #3FB1FF; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 8px;">AWS Student Builder Group · Dhule</p>
          <h1 style="font-size: 2.25rem; font-weight: 900; line-height: 1.1; margin: 0 0 16px 0; color: #FFFFFF;">Register for Free Community Pass — AWS re:Invent Dhule 2026</h1>
          <p style="font-size: 1.05rem; color: #CBD5E1; line-height: 1.6; margin: 0 0 24px 0;">Claim your free verified digital entry pass for AWS re:Invent Watch &amp; Build Party Dhule 2026 on Friday, 04 December 2026 (09:00 AM – 04:00 PM IST) at Hotel Anand Regency Riverfront, Dhule.</p>
        </header>
        <section style="margin: 24px 0; padding: 22px; background: #0E1526; border: 1px solid #1E293B; border-radius: 12px; line-height: 1.6;">
          <h2 style="color: #3FB1FF; font-size: 1.25rem; margin-top: 0;">3-Step Registration Process</h2>
          <p><strong>1. RSVP on AWS Builder Center:</strong> Register on the official <a href="https://builder.aws.com/connect/event/c8a38d77-8262-34c4-b744-ea8dfb7b35a6" style="color: #3FB1FF; text-decoration: underline;">AWS Builder Center Event Page</a> using your Builder ID alias.</p>
          <p><strong>2. Submit Your Local Pass Request:</strong> Enter your AWS Builder ID, college/organization, phone number, and email for manual organizer verification.</p>
          <p><strong>3. Manual Review &amp; Confirmation Call:</strong> Seats are limited (300 capacity). Our organizing team reviews every submission and confirms selected attendees by phone call and email with a QR entry pass.</p>
        </section>
        <nav style="margin-top: 32px; border-top: 1px solid #1E293B; padding-top: 20px; font-size: 0.9rem;">
          <a href="/" style="color: #3FB1FF; text-decoration: underline; margin-right: 20px;">&larr; Back to Event Home</a>
          <a href="/codeofconduct" style="color: #3FB1FF; text-decoration: underline;">Code of Conduct &amp; Terms</a>
        </nav>
      </article>`,
  },
  {
    route: 'codeofconduct',
    title: 'Code of Conduct · AWS re:Invent Dhule 2026',
    itemName: 'Terms & Code of Conduct · AWS re:Invent Dhule 2026',
    description:
      'Official Code of Conduct, Terms & Conditions, and attendee guidelines for AWS re:Invent Watch & Build Party Dhule 2026 hosted by AWS Student Builder Group Dhule.',
    breadcrumbName: 'Code of Conduct',
    noscriptHtml: `<article id="seo-crawl-shell" style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #F3F4F6;">
        <header>
          <p style="color: #FF57E8; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 8px;">Official Community Policy &amp; Terms · Dhule 2026</p>
          <h1 style="font-size: 2.25rem; font-weight: 900; line-height: 1.1; margin: 0 0 16px 0; color: #FFFFFF;">Terms &amp; Conditions and Code of Conduct</h1>
          <p style="font-size: 1.05rem; color: #CBD5E1; line-height: 1.6; margin: 0 0 24px 0;">Official participation guidelines for AWS re:Invent Watch &amp; Build Party Dhule 2026 at Hotel Anand Regency Riverfront hosted by AWS Student Builder Group Dhule.</p>
        </header>
        <section style="margin: 24px 0; padding: 22px; background: #0E1526; border: 1px solid #1E293B; border-radius: 12px; line-height: 1.6;">
          <h2 style="color: #3FB1FF; font-size: 1.25rem; margin-top: 0;">Community Standards &amp; Entry Guidelines</h2>
          <p>We enforce a welcoming, respectful, and harassment-free environment for all students, speakers, sponsors, and guests. Verified digital QR passes and valid college/government ID are required at check-in.</p>
          <p>For questions or conduct reporting, contact <a href="mailto:info@reinvent.awssbgdhule.in" style="color: #3FB1FF; text-decoration: underline;">info@reinvent.awssbgdhule.in</a>.</p>
        </section>
        <nav style="margin-top: 32px; border-top: 1px solid #1E293B; padding-top: 20px; font-size: 0.9rem;">
          <a href="/" style="color: #3FB1FF; text-decoration: underline; margin-right: 20px;">&larr; Back to Event Home</a>
          <a href="/register" style="color: #3FB1FF; text-decoration: underline;">Register for Free Pass</a>
        </nav>
      </article>`,
  },
];

function escapeHtmlAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function buildRouteHtml(baseHtml: string, cfg: StaticRouteSeoConfig): string {
  const routeUrl = `${BASE_URL}/${cfg.route}`;
  const escapedTitle = escapeHtmlAttr(cfg.title);
  const escapedName = escapeHtmlAttr(cfg.itemName);
  const escapedDesc = escapeHtmlAttr(cfg.description);

  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapedTitle}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escapedDesc}" />`
    )
    .replace(
      /<link rel="canonical" href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${routeUrl}" />`
    )
    .replace(
      /<link rel="alternate" hreflang="en-in" href="[^"]*"\s*\/>/,
      `<link rel="alternate" hreflang="en-in" href="${routeUrl}" />`
    )
    .replace(
      /<link rel="alternate" hreflang="en" href="[^"]*"\s*\/>/,
      `<link rel="alternate" hreflang="en" href="${routeUrl}" />`
    )
    .replace(
      /<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/>/,
      `<link rel="alternate" hreflang="x-default" href="${routeUrl}" />`
    )
    .replace(
      /<meta itemprop="name" content="[^"]*"\s*\/>/,
      `<meta itemprop="name" content="${escapedName}" />`
    )
    .replace(
      /<meta itemprop="description" content="[^"]*"\s*\/>/,
      `<meta itemprop="description" content="${escapedDesc}" />`
    )
    .replace(
      /<meta property="og:url" content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${routeUrl}" />`
    )
    .replace(
      /<meta property="og:title" content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${escapedName}" />`
    )
    .replace(
      /<meta property="og:description" content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${escapedDesc}" />`
    )
    .replace(
      /<meta name="twitter:url" content="[^"]*"\s*\/>/,
      `<meta name="twitter:url" content="${routeUrl}" />`
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${escapedName}" />`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${escapedDesc}" />`
    )
    .replace(
      /<article[\s\S]*?id="seo-crawl-shell"[\s\S]*?<\/article>/,
      cfg.noscriptHtml
    );

  html = html.replace(
    /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,
    (_, open: string, jsonText: string, close: string) => {
      const schema = JSON.parse(jsonText);
      if (Array.isArray(schema['@graph'])) {
        for (const node of schema['@graph']) {
          if (node['@type'] === 'WebPage') {
            node['@id'] = `${routeUrl}#webpage`;
            node.url = routeUrl;
            node.name = cfg.title;
            node.description = cfg.description;
          } else if (node['@type'] === 'BreadcrumbList') {
            node.itemListElement = [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
              { '@type': 'ListItem', position: 2, name: cfg.breadcrumbName, item: routeUrl },
            ];
          }
        }
      }
      return `${open}\n    ${JSON.stringify(schema, null, 2)}\n    ${close}`;
    }
  );

  return html;
}

function seoStaticRoutesPlugin(): Plugin {
  let outDir = 'dist';
  return {
    name: 'seo-static-routes',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const indexPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;
      const baseHtml = fs.readFileSync(indexPath, 'utf8');
      for (const cfg of STATIC_ROUTES) {
        const routeDir = path.join(outDir, cfg.route);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, 'index.html'), buildRouteHtml(baseHtml, cfg), 'utf8');
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), seoStaticRoutesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  };
});
