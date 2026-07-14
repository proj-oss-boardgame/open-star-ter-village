import fs from 'fs';
import { join } from 'path';

const FOOTER_FOLDER = '_footer';

export function fetchFooter(lang) {
  const filePath = join(process.cwd(), FOOTER_FOLDER, lang, 'footer.json');

  const file = fs.readFileSync(filePath, 'utf8');

  const rawFooter = JSON.parse(file).footer;
  const footer = {
    ...(rawFooter.original_version_label
      ? { originalVersionLabel: rawFooter.original_version_label }
      : {}),
    ...(rawFooter.localized_version_label
      ? { localizedVersionLabel: rawFooter.localized_version_label }
      : {}),
    links: rawFooter.links.map((link) => ({
      displayText: link.display_text,
      url: link.url,
    })),
    logos: rawFooter.logos.map((logo) => ({
      title: logo.title,
      imageUrl: logo.image_url,
      altText: logo.alt_text,
      linkUrl: logo.link_url,
      ...(logo.width != null ? { width: logo.width } : {}),
      ...(logo.height != null ? { height: logo.height } : {}),
    })),
    supporters: (rawFooter.supporters ?? []).map((s) => ({
      ...(s.title ? { title: s.title } : {}),
      imageUrl: s.image_url,
      altText: s.alt_text,
      linkUrl: s.link_url,
      ...(s.width != null ? { width: s.width } : {}),
      ...(s.height != null ? { height: s.height } : {}),
    })),
  };
  return footer;
}
