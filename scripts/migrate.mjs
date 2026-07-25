/**
 * Bước 2: Chuyển _backup/raw-json/posts.json (WordPress) → src/content/posts/*.md
 * Chạy: node scripts/migrate.mjs
 *
 * Điểm cần chú ý khi đọc code này:
 *  - Code block của plugin "code-block-pro" giữ code THÔ trong attribute data-code
 *    của nút Copy. Đó là nguồn trích xuất sạch nhất — chính xác hơn textContent
 *    của <pre> (vốn đã bị Shiki cắt thành hàng trăm <span> màu).
 *  - Emoji Facebook được chèn dưới dạng <img src=".../1f602.png"> — tên file là
 *    codepoint Unicode, nên khôi phục được thành emoji thật.
 */
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { REMOVED_WP_IDS, REMOVED_POSTS, PROTECTED_SLUGS } from './removed-posts.mjs';

const ROOT = process.cwd();
const RAW = join(ROOT, '_backup', 'raw-json');
const OUT = join(ROOT, 'src', 'content', 'posts');
const GAMES_OUT = join(ROOT, 'public', 'games');

// ---------------------------------------------------------------- tiện ích

/** Bỏ dấu tiếng Việt, emoji, ký tự URL-encode → slug ASCII sạch. */
function cleanSlug(rawSlug) {
  let s = rawSlug;
  // WP trả slug đã URL-encode (vd "%f0%9f%8f%86-vi-sao-...") → decode trước
  try {
    s = decodeURIComponent(s);
  } catch {
    /* slug có % lẻ, giữ nguyên */
  }
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // dấu tổ hợp
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '') // emoji
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Giải HTML entity + chuẩn hoá khoảng trắng cho text ngắn (title, alt, caption). */
function decodeText(html) {
  const { window } = new JSDOM('');
  const el = window.document.createElement('textarea');
  el.innerHTML = html;
  return el.value.replace(/\s+/g, ' ').trim();
}

/** Đoán ngôn ngữ code block để Shiki highlight lại đúng. */
function guessLang(code) {
  const c = code.trim();

  // Phiên REPL Python (>>> / ...) — nhiều nhất trong bài "python từ không đến có"
  if (/^\s*(>>>|\.\.\.)\s/m.test(c)) return 'python';

  if (/^(PS |PS[A-Z]?>|Set-ExecutionPolicy|Get-ExecutionPolicy|npm : File)/im.test(c)) return 'powershell';

  // C# nhận diện trước Java: nhiều token chỉ có ở C#
  const csharp = /\busing\s+System\b|\bnamespace\s+\w+|\bIWebDriver\b|\bChromeOptions\b|\[(Test|TestMethod|Given|When|Then|SetUp|TearDown|Binding)\b|\{\s*get;\s*set;\s*\}|\bpublic\s+async\s+Task\b|\bstring\[\]\s+args\b/;
  if (csharp.test(c)) return 'csharp';

  // Java
  if (/\bpublic\s+class\b|\bSystem\.out\.print|\bimport\s+java\.|\bpublic\s+static\s+void\s+main\b/.test(c)) return 'java';

  // Thân method kiểu C-family (không có class bao ngoài): `private Foo Bar()` + dấu {}
  if (/^\s*(public|private|protected|internal)\s+[\w<>[\],\s]+\s+\w+\s*\([^)]*\)\s*$/m.test(c) && c.includes('{')) {
    return /\bvar\b|\bstring\b|\bbool\b|\/\/|\bnew\s+[A-Z]\w*\(\)/.test(c) ? 'csharp' : 'java';
  }

  if (/^\s*(def|import|from|print|class)\b/m.test(c) || /^\s*if\s+__name__/m.test(c)) return 'python';
  if (/\bawait\s+page\.|\brequire\(|\bconst\s+\{|=>|\bconsole\.log|@playwright\/test|\bdocument\./.test(c)) return 'javascript';
  if (/^\s*(npm|npx|yarn|pnpm|git|mvn|cd|dotnet|pip|python)\s/m.test(c)) return 'bash';
  if (/^\s*<\?xml|^\s*<(project|dependency|configuration)\b/m.test(c)) return 'xml';
  if (/^\s*[{[][\s\S]*[}\]]\s*$/.test(c) && /"\s*:/.test(c)) return 'json';

  // Python không có từ khoá đặc trưng: khối `if ...:` / `for ...:` kết thúc bằng dấu hai chấm,
  // không dùng `;` cuối dòng và không có `{}` — mấy ví dụ Selenium-Python trong bài Playwright.
  if (/^\s*(if|elif|else|for|while|with|try|except)\b[^;{}]*:\s*$/m.test(c) && !/[;{}]/.test(c)) return 'python';

  return 'text';
}

/** Codepoint từ tên file emoji Facebook → emoji thật. */
function fbEmojiToChar(src) {
  const m = src.match(/\/([0-9a-f]{4,6}(?:_[0-9a-f]{4,6})*)\.png/i);
  if (!m) return null;
  try {
    return m[1]
      .split('_')
      .map((h) => String.fromCodePoint(parseInt(h, 16)))
      .join('‍');
  } catch {
    return null;
  }
}

// ------------------------------------------------ game tương tác

/**
 * Hai bài "guess-my-number" và "the-pig-game" nhúng hẳn một web app JS vào nội dung,
 * kèm CSS reset toàn cục (`* { margin: 0 }`, `html { font-size: 62.5% }`, `body { background: #222 }`).
 * Nhúng thẳng vào bài sẽ phá layout blog, nên tách ra trang HTML độc lập trong
 * public/games/ rồi nhúng lại bằng iframe — iframe là ranh giới cách ly CSS đúng đắn.
 *
 * @returns {{prose: string, game: string} | null} null nếu bài không chứa app.
 */
function splitInteractiveApp(html) {
  if (!/<script[\s>]/i.test(html)) return null;
  const starts = [/<!DOCTYPE/i, /<style[\s>]/i].map((re) => html.search(re)).filter((i) => i >= 0);
  if (!starts.length) return null;
  const start = Math.min(...starts);
  return { prose: html.slice(0, start), game: html.slice(start) };
}

/** Gói fragment/document của game thành một trang HTML độc lập, có tự báo chiều cao ra iframe cha. */
function buildGamePage(gameHtml, title) {
  const { document } = new JSDOM(gameHtml).window;

  // Tách CSS ra <head>, phần còn lại (markup + script) làm <body>
  const headParts = [];
  for (const el of document.querySelectorAll('style, link[rel="stylesheet"]')) {
    headParts.push(el.outerHTML);
    el.remove();
  }
  const bodyHtml = document.body.innerHTML.trim();

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
${headParts.join('\n')}
</head>
<body>
${bodyHtml}
<script>
  // Báo chiều cao thật ra trang cha để iframe không bị cắt hay thừa chỗ trống.
  const kcReportHeight = () => {
    const h = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    parent.postMessage({ kcGameHeight: h }, '*');
  };
  addEventListener('load', kcReportHeight);
  addEventListener('click', () => requestAnimationFrame(kcReportHeight));
  // ResizeObserver bọc trong try: nếu môi trường không có nó, throw ở đây sẽ làm
  // chết cả phần script còn lại và mất luôn cơ chế báo chiều cao.
  try {
    new ResizeObserver(kcReportHeight).observe(document.body);
  } catch {}
</script>
</body>
</html>
`;
}

// ---------------------------------------------------- tiền xử lý DOM

/**
 * Dọn HTML của WordPress TRƯỚC khi đưa vào turndown.
 * Trả về { warnings } — mọi thứ không xử lý được đều phải báo ra, không im lặng bỏ qua.
 */
function preprocess(document, slug) {
  const warnings = [];

  // 1. Code block của plugin code-block-pro → <pre><code class="language-x">
  for (const wrap of document.querySelectorAll('.wp-block-kevinbatdorf-code-block-pro')) {
    const copyBtn = wrap.querySelector('[data-code]');
    const pre = wrap.querySelector('pre');
    const raw = copyBtn?.getAttribute('data-code') ?? pre?.textContent ?? '';
    const code = raw.replace(/\r\n/g, '\n').replace(/\n+$/, '');
    if (!code.trim()) {
      warnings.push('code block rỗng, đã bỏ');
      wrap.remove();
      continue;
    }
    const el = document.createElement('pre');
    const inner = document.createElement('code');
    inner.className = `language-${guessLang(code)}`;
    inner.textContent = code;
    el.appendChild(inner);
    wrap.replaceWith(el);
  }

  // 2. <pre class="shiki"> đứng lẻ (không nằm trong wrapper plugin)
  for (const pre of document.querySelectorAll('pre.shiki')) {
    const code = (pre.textContent ?? '').replace(/\r\n/g, '\n').replace(/\n+$/, '');
    const el = document.createElement('pre');
    const inner = document.createElement('code');
    inner.className = `language-${guessLang(code)}`;
    inner.textContent = code;
    el.appendChild(inner);
    pre.replaceWith(el);
  }

  // 3. <pre class="wp-block-preformatted"> (editor cũ) → code block
  for (const pre of document.querySelectorAll('pre.wp-block-preformatted, pre.wp-block-code')) {
    const code = (pre.textContent ?? '').replace(/\r\n/g, '\n').replace(/\n+$/, '');
    const el = document.createElement('pre');
    const inner = document.createElement('code');
    inner.className = `language-${guessLang(code)}`;
    inner.textContent = code;
    el.appendChild(inner);
    pre.replaceWith(el);
  }

  // 4. Emoji Facebook dạng <img> → ký tự emoji thật
  for (const img of document.querySelectorAll('img[src*="fbcdn.net/images/emoji"]')) {
    const src = img.getAttribute('src') ?? '';
    const char = fbEmojiToChar(src) ?? decodeText(img.getAttribute('alt') ?? '') ?? '';
    img.replaceWith(document.createTextNode(char));
  }

  // 5. Bỏ srcset/sizes/class/style trên ảnh — chỉ giữ src + alt, tránh rác trong markdown
  for (const img of document.querySelectorAll('img')) {
    for (const a of ['srcset', 'sizes', 'class', 'style', 'width', 'height', 'loading', 'decoding', 'fetchpriority']) {
      img.removeAttribute(a);
    }
    // WP hay bọc ảnh trong <a href="ảnh cỡ lớn"> → bỏ link, giữ ảnh
    const parentA = img.parentElement;
    if (parentA?.tagName === 'A' && /\.(jpe?g|png|gif|webp|avif)/i.test(parentA.getAttribute('href') ?? '')) {
      parentA.replaceWith(img);
    }
  }

  // 6. Cảnh báo phần tử cần người xem lại
  for (const iframe of document.querySelectorAll('iframe')) {
    warnings.push(`iframe cần chèn lại thủ công: ${iframe.getAttribute('src')}`);
  }
  for (const el of document.querySelectorAll('script, style, ins, .sharedaddy, .jp-relatedposts, #jp-post-flair')) {
    el.remove();
  }

  // 7. Xoá div/span rỗng do Gutenberg sinh ra (làm nhiều lượt vì lồng nhau)
  for (let i = 0; i < 4; i++) {
    for (const el of document.querySelectorAll('div, span, p')) {
      if (!el.textContent?.trim() && !el.querySelector('img, pre, hr, iframe, br')) el.remove();
    }
  }

  return warnings;
}

// ---------------------------------------------------------- turndown

function makeTurndown() {
  const td = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
  });

  // Fenced code block giữ nguyên thụt lề + gắn language
  td.addRule('fencedCode', {
    filter: (node) => node.nodeName === 'PRE' && node.firstChild?.nodeName === 'CODE',
    replacement: (_content, node) => {
      const codeEl = node.firstChild;
      const lang = (codeEl.className.match(/language-(\S+)/) ?? [, ''])[1];
      const code = codeEl.textContent.replace(/\n+$/, '');
      // Nếu code có chứa ``` thì dùng fence dài hơn để không bị phá cấu trúc
      const fence = code.includes('```') ? '````' : '```';
      return `\n\n${fence}${lang}\n${code}\n${fence}\n\n`;
    },
  });

  // figure + figcaption → ảnh kèm chú thích in nghiêng
  td.addRule('figureImage', {
    filter: (node) => node.nodeName === 'FIGURE' && node.querySelector('img'),
    replacement: (_content, node) => {
      const img = node.querySelector('img');
      const src = img.getAttribute('src') ?? '';
      const alt = (img.getAttribute('alt') ?? '').replace(/[[\]]/g, '');
      const cap = node.querySelector('figcaption')?.textContent?.trim();
      return `\n\n![${alt}](${src})${cap ? `\n*${cap}*` : ''}\n\n`;
    },
  });

  // wp-block-separator (thường là <hr>) đã được turndown lo; chỉ cần chắc <hr> ra "---"
  td.addRule('separator', {
    filter: 'hr',
    replacement: () => '\n\n---\n\n',
  });

  return td;
}

/** Dọn markdown sau khi turndown chạy. */
function postprocess(md) {
  return (
    md
      // Bỏ escape thừa turndown thêm vào (\[ \] \_ \* trong văn xuôi tiếng Việt)
      .replace(/\\([[\]()#+\-_*`~>.!])/g, '$1')
      // Xoá non-breaking space và zero-width mà WP hay chèn
      .replace(/ /g, ' ')
      .replace(/[​﻿]/g, '')
      // Gom nhiều dòng trống liên tiếp thành 1 dòng trống
      .replace(/\n{3,}/g, '\n\n')
      // Bỏ khoảng trắng cuối dòng (trừ 2 space ngắt dòng cố ý — ta không dùng)
      .replace(/[ \t]+$/gm, '')
      .trim() + '\n'
  );
}

/** Escape chuỗi cho YAML double-quoted. */
function yamlStr(s) {
  return `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** Số chữ cái thật (bỏ emoji, dấu câu, khoảng trắng) — dùng để biết mô tả có nội dung hay không. */
const letterCount = (s) => (s.match(/[\p{L}\p{N}]/gu) ?? []).length;

/**
 * Rút mô tả ngắn cho thẻ meta description.
 * Thứ tự ưu tiên: excerpt của WP → đoạn văn đầu bài → câu suy ra từ tiêu đề.
 * Bước cuối cần thiết vì có bài (vd "Khi bạn làm Tester cho LG…") chỉ gồm emoji
 * và một tấm ảnh, không có chữ nào để lấy.
 */
function makeDescription(post, bodyMd, title) {
  let text = decodeText((post.excerpt?.rendered ?? '').replace(/<[^>]+>/g, ' '));
  text = text.replace(/\s*\[?…\]?\s*$/, '').replace(/\s*Continue reading.*$/i, '').trim();

  if (letterCount(text) < 25) {
    const firstPara = bodyMd.split('\n').find((l) => l.trim() && !/^[#>\-*`![]/.test(l.trim()));
    if (firstPara && letterCount(firstPara) >= 25) text = firstPara.replace(/[*_`[\]()]/g, '').trim();
  }

  if (letterCount(text) < 25) text = `${title} — bài viết trên blog KcLearnCode.`;

  if (text.length > 165) text = text.slice(0, 162).replace(/\s+\S*$/, '') + '…';
  return text;
}

// ------------------------------------------------------------------ main

const allPosts = JSON.parse(await readFile(join(RAW, 'posts.json'), 'utf8'));
const posts = allPosts.filter((p) => !REMOVED_WP_IDS.has(p.id));

// Giữ lại nội dung các bài đã sửa tay TRƯỚC khi xoá thư mục, rồi ghi trả lại sau.
// Không làm bước này thì mỗi lần migrate là mất hết công viết lại.
const preserved = new Map();
for (const slug of PROTECTED_SLUGS) {
  const existing = (await readdir(OUT).catch(() => [])).find(
    (f) => f.endsWith('.md') && f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-/, '') === slug,
  );
  if (existing) preserved.set(existing, await readFile(join(OUT, existing), 'utf8'));
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await rm(GAMES_OUT, { recursive: true, force: true });
await mkdir(GAMES_OUT, { recursive: true });

const td = makeTurndown();
const report = [];
const slugSeen = new Map();

for (const post of posts) {
  const slug = (() => {
    const base = cleanSlug(post.slug) || `post-${post.id}`;
    const n = (slugSeen.get(base) ?? 0) + 1;
    slugSeen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  })();

  const title = decodeText(post.title.rendered);

  // Tách web app tương tác (nếu có) ra trang riêng trước khi chuyển sang markdown
  const app = splitInteractiveApp(post.content.rendered);
  let htmlForMarkdown = post.content.rendered;
  let gameEmbed = '';
  if (app) {
    await writeFile(join(GAMES_OUT, `${slug}.html`), buildGamePage(app.game, title), 'utf8');
    htmlForMarkdown = app.prose;
    gameEmbed = [
      '',
      `<iframe data-kc-game src="/games/${slug}.html" title=${JSON.stringify(title)} loading="lazy" style="width:100%;height:640px;border:0;border-radius:8px"></iframe>`,
      '',
      `[Mở game ở tab riêng ↗](/games/${slug}.html)`,
      '',
    ].join('\n');
  }

  const dom = new JSDOM(`<body>${htmlForMarkdown}</body>`);
  const { document } = dom.window;
  const warnings = preprocess(document, slug);

  const bodyMd = postprocess(td.turndown(document.body.innerHTML)) + gameEmbed;

  // Ảnh đại diện + phân loại từ _embedded
  const fm = post._embedded?.['wp:featuredmedia']?.[0];
  const heroUrl = fm?.source_url ?? null;
  const heroAlt = decodeText(fm?.alt_text || '') || null;

  const terms = (post._embedded?.['wp:term'] ?? []).flat();
  const categories = terms
    .filter((t) => t.taxonomy === 'category' && t.slug !== 'uncategorized')
    .map((t) => decodeText(t.name));
  const tags = terms.filter((t) => t.taxonomy === 'post_tag').map((t) => decodeText(t.name));

  const pubDate = post.date.slice(0, 10);
  const modified = post.modified?.slice(0, 10);

  const frontmatter = [
    '---',
    `title: ${yamlStr(title)}`,
    `description: ${yamlStr(makeDescription(post, bodyMd, title))}`,
    `pubDate: ${pubDate}`,
    modified && modified !== pubDate ? `updatedDate: ${modified}` : null,
    `categories: [${categories.map(yamlStr).join(', ')}]`,
    `tags: [${tags.map(yamlStr).join(', ')}]`,
    heroUrl ? `heroImage: ${yamlStr(heroUrl)}` : null,
    heroAlt ? `heroImageAlt: ${yamlStr(heroAlt)}` : null,
    'draft: false',
    `wpId: ${post.id}`,
    `wpSlug: ${yamlStr(post.slug)}`,
    '---',
    '',
  ]
    .filter((l) => l !== null)
    .join('\n');

  const filename = `${pubDate.slice(0, 7)}-${slug}.md`;
  await writeFile(join(OUT, filename), frontmatter + bodyMd, 'utf8');

  // Thống kê để verify
  const codeBlocks = (bodyMd.match(/^```/gm) ?? []).length / 2;
  const images = [...bodyMd.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1]);
  const external = [...images, ...(heroUrl ? [heroUrl] : [])].filter((u) => !u.includes('kclearncode.com'));
  // Chỉ soi HTML sót ở phần VĂN XUÔI — bỏ qua nội dung trong code fence,
  // nếu không traceback Python (`File "<stdin>", line 1, in <module>`) sẽ bị báo giả.
  // iframe của game là chủ ý, cũng bỏ qua.
  const prose = bodyMd.replace(/^```[\s\S]*?^```$/gm, '').replace(/<\/?iframe[^>]*>/g, '');
  const leftoverHtml = [...prose.matchAll(/<(?!br\s*\/?>)([a-z]+)[\s>]/gi)].map((m) => m[1]);

  report.push({ filename, title, codeBlocks, images: images.length, external, leftoverHtml, warnings, hasGame: !!app });
}

// Ghi trả bài đã sửa tay, đè lên bản vừa sinh từ WordPress
for (const [filename, content] of preserved) {
  await writeFile(join(OUT, filename), content, 'utf8');
}

// ------------------------------------------------------------- báo cáo

console.log(`Đã ghi ${report.length} file vào src/content/posts/`);
if (preserved.size) {
  console.log(`Giữ nguyên ${preserved.size} bài đã sửa tay (không ghi đè):`);
  for (const f of preserved.keys()) console.log(`  - ${f}`);
}
if (REMOVED_POSTS.length) {
  console.log(`Bỏ qua ${REMOVED_POSTS.length} bài đã chủ ý xoá (xem scripts/removed-posts.mjs):`);
  for (const r of REMOVED_POSTS) console.log(`  - ${r.slug} — ${r.reason}`);
}
console.log('');
console.log('FILE'.padEnd(58), 'CODE', ' IMG', ' GAME');
for (const r of report) {
  console.log(r.filename.padEnd(58), String(r.codeBlocks).padStart(4), String(r.images).padStart(4), r.hasGame ? '  ✓' : '');
}

const games = report.filter((r) => r.hasGame);
if (games.length) {
  console.log(`\n🎮 Đã tách ${games.length} web app tương tác ra public/games/ (nhúng lại bằng iframe):`);
  for (const r of games) console.log(`  ${r.filename}`);
}

const withWarn = report.filter((r) => r.warnings.length);
if (withWarn.length) {
  console.log('\n⚠ CẢNH BÁO (cần người xem lại):');
  for (const r of withWarn) for (const w of r.warnings) console.log(`  ${r.filename}: ${w}`);
}

const withHtml = report.filter((r) => r.leftoverHtml.length);
if (withHtml.length) {
  console.log('\n⚠ CÒN THẺ HTML THÔ trong markdown:');
  for (const r of withHtml) console.log(`  ${r.filename}: <${[...new Set(r.leftoverHtml)].join('> <')}>`);
}

const ext = new Set(report.flatMap((r) => r.external));
console.log(`\nẢnh host ngoài kclearncode.com: ${ext.size} URL (bước download-images sẽ tải về):`);
for (const u of ext) console.log(`  ${new URL(u).host}${u.length > 90 ? ' …' : ''}`);

console.log(`\nTổng: ${report.reduce((s, r) => s + r.codeBlocks, 0)} code block, ${report.reduce((s, r) => s + r.images, 0)} ảnh trong bài.`);
