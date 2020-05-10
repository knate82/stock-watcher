app.service('findStockService', function ($http) {
  const constants = {
    key: 'HY0JP87WH3PG17X6',
    baseUrl: 'https://www.alphavantage.co/query',
    searchTypes: {
      data: 'getData',
      name: 'getName'
    },
    weekend: {
      sunday: 0,
      monday: 1
    }
  }
  let self = this;
  let yesterday;

  self.createUrl = function (ticker, type) {
    let search;
    const apKey = `&apikey=${constants.key}`;
    if (type === constants.searchTypes.name) {
      search = `?function=SYMBOL_SEARCH&keywords=${ticker}`;
    } else {
      search = `?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}`
    }
    return `${constants.baseUrl}${search}${apKey}`;
  }

  self.calculateChangePercentage = function (change, open) {
    return (parseInt(change) / parseInt(open)).toString();
  }

  self.cleanDayData = function (data) {
    let cleanData = {};
    cleanData.open = (parseInt(data['1. open']).toFixed(2)).toString();
    cleanData.high = (parseInt(data['2. high']).toFixed(2)).toString();
    cleanData.low = (parseInt(data['3. low']).toFixed(2)).toString();
    cleanData.close = (parseInt(data['4. close']).toFixed(2)).toString();
    cleanData.change = (parseInt(cleanData.open) - parseInt(cleanData.close)).toString();
    cleanData.changePercentage = self.calculateChangePercentage(cleanData.change, cleanData.open);
    return cleanData;
  }

  self.getCompanyName = (ticker) => {
    let nameUrl = self.createUrl(ticker, constants.searchTypes.name);
    return $http.get(nameUrl)
      .then(response => {
        return Promise.resolve(response.data['bestMatches'][0]['2. name']);
      })
      .catch(err => {
        console.log(err);
        return Promise.reject(err);
      })
  }

  self.getStockData = (ticker) => {
    let dataUrl = self.createUrl(ticker, constants.searchTypes.data);
    return $http.get(dataUrl)
      .then(response => {
        return Promise.resolve(self.cleanDayData(response.data['Time Series (Daily)'][`${yesterday}`]));
      })
      .catch(err => {
        console.log(err);
        return Promise.reject(err);
      });
  }

  self.findStock = async (ticker) => {
    let returnData = {};
    try {
      let name = await self.getCompanyName(ticker);
      let stockData = await self.getStockData(ticker);
      returnData.symbol = ticker;
      returnData.name = name;
      returnData.data = stockData;
      return Promise.resolve(returnData);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  self.day = function (date) {
    let today = date.getDay();
    switch (today) {
      case constants.weekend.sunday:
        return 2;
      case constants.weekend.monday:
        return 3;
      default:
        return 1;
    }
  }

  self.yesterday = function () {
    let d = new Date();
    let dayToPull = self.day(d);
    let today = d.toISOString().slice(0, 10).split('-');
    if (today[2][0] === '0') {
      today[2] = today[2].split('');
      today[2][1] = parseInt(today[2][1]) - dayToPull;
      today[2] = today[2].join('');
    } else {
      today[2] = (parseInt(today[2]) - dayToPull).toString();
      if (today[2].length === 1) {
        today[2] = `0${today[2]}`;
      }
    }
    yesterday = today.join('-');
  }();
});