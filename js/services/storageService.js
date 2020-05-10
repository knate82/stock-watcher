app.service('storageService', function () {
  let storedStocks = [];
  let self = this;

  self.getStocks = () => {
    return storedStocks;
  }

  self.addStock = stock => {
    storedStocks.push(stock);
  }

});