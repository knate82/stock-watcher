app.controller('stockController', function ($scope, findStockService, storageService) {
  $scope.buttonText = 'Add Stock';
  $scope.placeholder = 'Enter stock symbol';
  $scope.stocks;

  $scope.findStock = async ($event) => {
    $event.preventDefault();
    try {
      let stockResult = await findStockService.findStock($scope.tickerSymbol.toUpperCase());
      storageService.addStock(stockResult);
      $scope.stocks = storageService.getStocks();
    } catch (err) {
      console.log(err);
    }
    $scope.tickerSymbol = '';
  }
});