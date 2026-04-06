import fs from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { processCard } from '../utils/processCard';

const cardsDirectory = join(process.cwd(), '_cards');

/**
 * lang ISO language and locale string
 * e.g. 'zh-Hant', 'en', 'en-us', ...
 */
function getCardDirectoryPath(lang) {
  // return language folder path
  return join(cardsDirectory, lang);
}



export function fetchAllCards(lang) {
  // const cardsDirectory = getCardDirectoryPath(lang);
  // const filesInCards = fs.readdirSync(cardsDirectory);

  const raw = fs.readFileSync(join(process.cwd(), 'figma-cards-output.json'), 'utf8');
    // console.log(raw)
  const jsonCards = JSON.parse(raw);
  // console.log(jsonCards)

    const cards = jsonCards.map((card) => {
    const  data = {
      title: card.title,
      description: card.description,
      type: card.type,
      category: card.category,
      image: card.image ?? '',
      tags: card.tags,
      links: card.links ?? [],
    };
    const content = card.content ?? '';

    return {data, content};
  });


  return cards.map((card) => processCard(card, cards));

  // const cards = filesInCards.map((filename) => {
  //   const fullPath = join(cardsDirectory, filename);
  //   const file = fs.readFileSync(fullPath, 'utf8');
  //   const matterFile = matter(file);
  //   const { data, content } = matterFile;

  //   return { data, content };
  // });

  // return cards.map((card) => processCard(card, cards));
}
