const _ = require('lodash');
const { BotTextMessage, Logger, QuickrepliesMessage, WebAdapter } = require('botfuel-dialog');
const { SearchView } = require('botfuel-module-facetedsearch');

const logger = Logger('ArticleView');

const questions = {
  type: 'What do you want to buy?',
  brand: 'Which brand do you like?',
  color: 'What color do you like?',
  size: 'What is your size?',
  form: 'Which form do you like?',
  sleeve: 'What about sleeves?',
};

const getBotResponse = (facet, valueCounts) => {
  let facetValues = [];
  if (facet === 'size') {
    // size value is array like 'S,M,L'
    const array = valueCounts.map(o => o.value.split(','));
    facetValues = _.union(...array);
  } else {
    facetValues = valueCounts.map(o => o.value);
  }

  return [new BotTextMessage(questions[facet]), new QuickrepliesMessage(facetValues)];
};

const articleHtml = (data) => {
  let html = '<div>';
  html += `<div><img src="${WebAdapter.getStaticUrl(data.image)}" style="max-width:100%"/></div>`;
  html += `<div><strong>${data.brand}</strong> <strong style="float:right">${
    data.price
  } €</strong></div>`;
  html += `<div>${data.size}</div>`;
  if (data.cut) {
    html += `<div>${data.cut}</div>`;
  }

  if (data.material) {
    html += `<div>${data.material}</div>`;
  }
  html += '</div>';
  return html;
};

class ArticleView extends SearchView {
  render(userMessage, { matchedEntities, missingEntities, data, facetValueCounts }) {
    logger.debug('render', {
      matchedEntities,
      missingEntities,
      data,
      facetValueCounts,
    });

    if (missingEntities.size !== 0) {
      return getBotResponse(missingEntities.keys().next().value, facetValueCounts);
    }

    const messages = [];
    if (data && data.length > 0) {
      messages.push(new BotTextMessage(`Thank you. We have ${data.length} product${data.length > 1 ? 's' : ''}:`));
      _.forEach(data, (d) => {
        messages.push(new BotTextMessage(articleHtml(d)));
      });
    } else {
      messages.push(new BotTextMessage("Sorry we don't find any result!"));
    }
    return messages;
  }
}

module.exports = ArticleView;
