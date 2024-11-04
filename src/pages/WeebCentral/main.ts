import { pageInterface } from '../pageInterface';

export const WeebCentral: pageInterface = {
  name: 'WeebCentral',
  domain: 'https://weebcentral.com',
  languages: ['English'],
  type: 'manga',
  database: 'Weebcentral',
  isSyncPage(url) {
    if (url.split('/')[3] === 'chapters') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'series') {
      return true;
    }
    return false;
  },
  getImage() {
    return $('section section picture img').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('section.w-full a[href*="/series/"] span').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(WeebCentral.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j.$('section.w-full a[href*="/series/"]').first().attr('href'),
        WeebCentral.domain,
      );
    },
    getEpisode(url) {
      const chapterText = j
        .$('section.w-full button[hx-target="#chapter-select-body"] span')
        .first()
        .text()
        .trim();
      return getChapter(chapterText);
    },
    nextEpUrl(url) {
      const nextButton = j
        .$('section.w-full a span:contains("NEXT")')
        .closest('a[href*="/chapters/"]')
        .attr('href');
      return nextButton;
    },
    readerConfig: [
      {
        current: {
          selector: 'main img',
          mode: 'countAbove',
        },
        total: {
          selector: 'main img',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return j.$('section h1').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('strong:contains("Chapter List")').before(
        j.html(`<strong>MAL-Sync</strong><br>${selector}<br>`),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div#chapter-list > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), WeebCentral.domain) || '';
      },
      elementEp(selector) {
        return getChapter(selector.find('span > span').first().text().trim());
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    j.$(document).ready(function () {
      page.handlePage();

      utils.changeDetect(
        () => {
          if (WeebCentral.overview!.list!.elementsSelector().length) {
            page.handleList();
          }
        },
        () => {
          return WeebCentral.overview!.list!.elementsSelector().length;
        },
      );
    });
  },
};

function getChapter(text: string) {
  const res = /(ch|chapter|episode|ep|chap|chp)\D?(\d+)/i.exec(text);

  if (!res) return NaN;

  return Number(res[2]) || NaN;
}
