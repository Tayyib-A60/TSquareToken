App = {
    web3Provider: null,
    contracts: {},
    account: null,
    loading: false,
    tokenPrice: 0,
    tokensSold: 0,
    tokensAvailable: 100,

    init: function() {
        console.log("App initialized...");
        return App.initWeb3();
    },
    initWeb3: function() {
        if(typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContracts();
    },
    initContracts: function() {
        $.getJSON('AsixoTokenSale.json', function(asixoTokenSale) {
            App.contracts.AsixoTokenSale = TruffleContract(asixoTokenSale);
            App.contracts.AsixoTokenSale.setProvider(App.web3Provider);
            App.contracts.AsixoTokenSale.deployed().then((asixoTokenSale) => {
                // console.log('TokenSale Address', asixoTokenSale.address);
            })
        }).done(function() {
            $.getJSON('TSquareToken.json', (tSquareToken) => {
            App.contracts.TSquareToken = TruffleContract(tSquareToken);
            App.contracts.TSquareToken.setProvider(App.web3Provider);
            App.contracts.TSquareToken.deployed().then((tSquareToken) => {
            // console.log('TSquare Token Address', tSquareToken.address);
                    });
            return App.render();
                });
            });
    },
    render: function() {
        if(App.loading) {
            return;
        }
        var loader = $('#loader');
        var content = $('#content');

        web3.eth.getCoinbase(function(err, account) {
            if(err === null) {
                App.account = account;
                $('#accountAddress').html('Your account: ' + App.account)
                if(account !== null) {
                    App.loading = false;
                    loader.hide();
                    content.show();
                }
            }
        });

            App.contracts.AsixoTokenSale.deployed().then((instance) => {
                tokenSaleInstance = instance;
                return tokenSaleInstance.tokenPrice();
            }).then((price) => {
                App.tokenPrice = web3.fromWei(price.toNumber(), 'ether');
                $('.token-price').html(App.tokenPrice);
                return tokenSaleInstance.tokensSold();
            }).then((tokenSold) => {
                App.tokensSold = tokenSold.toNumber();
                $('.tokens-sold').html(App.tokensSold);
                return App.contracts.TSquareToken.deployed().then((instance) => {
                    tokenInstance = instance;
                    return tokenInstance.totalSupply();
                }).then((totalSupply) => {
                    App.tokensAvailable = totalSupply.toNumber();
                    $('.tokens-available').html(App.tokensAvailable);
                    return tokenInstance.balanceOf(App.account);
                }).then((balance) => {
                    $('.token-balance').html(balance.toNumber());
                })
            });

            var progressPercent = (App.tokensSold /  App.tokensAvailable) * 100;
            $('#progress').css('width', progressPercent, '%');

            loader.show();
            content.hide();
            App.loading = true;
    },

    buyTokens: function() {
        $('#content').hide();
        $('#loader').show();
        var numberOfTokens = $('#numberOfTokens').val();
        console.log(numberOfTokens);
        
        App.contracts.AsixoTokenSale.deployed().then((instance) => {
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: numberOfTokens * App.tokenPrice,
                gas: 500000
            }).then((reciept) => {
                console.log('Tokens bought');
                $('form').trigger('reset');
                $('loader').hide();                
                $('content').show();
            })
        })
    }
}
$(function() {
    $(window).load(function() {
        App.init();
    });
});