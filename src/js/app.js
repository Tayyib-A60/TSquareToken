App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 0,
    tokensSold: 0,
    tokensAvailable: 10000000,
    tokenAddress: '0x1058f6710cdA7a34411263261FB032c57fCB6766',
    tokenSaleAddress: '0x4685F88C0D4699CeD824ad3171472F9B94D8409C',
    balance: 0,
  
    init: function() {
      console.log("App initialized...");
      return App.initWeb3();
    },
  
    initWeb3: function() {
      if (typeof web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // Specify default instance if no web3 instance provided
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = new Web3(App.web3Provider);
      }
      return App.initContracts();
    },
  
    initContracts: function() {
      $.getJSON("AsixoTokenSale.json", function(asixoTokenSale) {
        App.contracts.AsixoTokenSale = TruffleContract(asixoTokenSale);
        App.contracts.AsixoTokenSale.setProvider(App.web3Provider);
        App.contracts.AsixoTokenSale.deployed().then(function(asixoTokenSale) {
        //   console.log("Dapp Token Sale Address:", asixoTokenSale.address);
        });
      }).done(function() {
        $.getJSON("TSquareToken.json", function(tSquareToken) {
          App.contracts.TSquareToken = TruffleContract(tSquareToken);
          App.contracts.TSquareToken.setProvider(App.web3Provider);
          App.contracts.TSquareToken.deployed().then(function(tSquareToken) {
            // console.log("Dapp Token Address:", tSquareToken.address);
          });
  
          App.listenForEvents();
            return App.render();
        });
      })
    },
  
    // Listen for events emitted from the contract
    listenForEvents: function() {
      App.contracts.AsixoTokenSale.deployed().then(function(instance) {
        instance.Sell({}, {
          fromBlock: 0,
          toBlock: 'latest',
        }).watch(function(error, event) {
          console.log("event triggered", event);
        })
      })
    },
  
    render: function() {
      if (App.loading) {
        return;
      }
      App.loading = true;
  
      var loader  = $('#loader');
      var content = $('#content');
  
      loader.show();
      content.hide();
      
      // Load account data
      web3.eth.getCoinbase(function(err, account) {
        if(err === null) {
          App.account = account;
          $('#accountAddress').html("Your Account: " + account);
        }
      })
      web3.eth.getBalance('0x025eaf226afbb7d4197bf7c2b793e814ac5fe26e', function(err, bal) {
        App.balance = bal.toNumber();
      });
      // Load token sale contract
      App.contracts.AsixoTokenSale.deployed().then(function(instance) {
        asixoTokenSaleInstance = instance;
        return asixoTokenSaleInstance.tokenPrice();
      }).then(function(tokenPrice) {
        App.tokenPrice = tokenPrice;
        $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
          return asixoTokenSaleInstance.tokensSold();
        }).then(function(tokensSold) {
          App.tokensSold = tokensSold.toNumber();
          $('.tokens-sold').html(App.tokensSold);
          $('.tokens-available').html(web3.fromWei(App.tokensAvailable));
  
        var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
        
        $('#progress').css('width', progressPercent + '%');

        // Load token contract
        App.contracts.TSquareToken.deployed().then(function(instance) {
          tSquareTokenInstance = instance;
          return tSquareTokenInstance.balanceOf(App.account);
        }).then(function(balance) {
          $('.token-balance').html(balance.toNumber());
          App.loading = false;
          loader.hide();
          content.show();
          return tSquareTokenInstance.balanceOf(App.tokenSaleAddress);
        }).then((tokensAvailable) => {
          // App.tokensAvailable = tokensAvailable;
          $('.tokens-sold').html(App.tokensSold);
          $('.tokens-available').html(App.tokensAvailable);
        })
      });
      // App.tranferTokensToTokenSale();
    },

    buyTokens: function() {
      $('#content').hide();
      $('#loader').show();
      var numberOfTokens = $('#numberOfTokens').val();
      App.contracts.AsixoTokenSale.deployed().then(function(instance) {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000 // Gas limit 
        });
      }).then(function(result) {
        console.log("Tokens bought...")
        $('form').trigger('reset') // reset number of tokens in form
        // Wait for Sell event
      });
    },
    tranferTokensToTokenSale: function() {
      // web3.eth.contract(abi)
      App.contracts.TSquareToken.deployed().then(function(instance) {
        instance.totalSupply().then((supply) => {
          console.log(supply);
          
        });
        
        // return instance.transfer(App.tokenSaleAddress, 10000000, {
        //   from: App.account
        // });
      })
    }
  }
  
  $(function() {
    $(window).load(function() {
      App.init();
    })
  });