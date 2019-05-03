var AsixoTokenSale = artifacts.require("./AsixoTokenSale.sol");
var TSquareToken = artifacts.require("./TSquareToken.sol");


contract('AsixoTokenSale', function(accounts) {
    var tokenSaleInstance;
    var tokenInstance;
    var tokenPrice = 1000000000000;
    var admin = accounts[0];
    var buyer = accounts[1];
    var numberOfTokens;
    var tokensAvailable = 750000;

    it('initializes the contract with the correct values', () => {
        return AsixoTokenSale.deployed().then((instance) => {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then((address) => {
            assert.notEqual(address, 0x0, 'has contract address');
            return tokenSaleInstance.tokenContract();
        }).then((address) => {
            assert.notEqual(address, 0x0, 'has contract address');
            return tokenSaleInstance.tokenPrice();
        }).then((price) => {
            assert.equal(price, tokenPrice, 'tokenPrice is correct');
        });
    });
    it('facilitates buying of token', () => {
        return TSquareToken.deployed().then((instance) => {
            tokenInstance = instance;
            return AsixoTokenSale.deployed()
        }).then((instance) => {
            tokenSaleInstance = instance;
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
        }).then((reciept) => {
            
            numberOfTokens = 10;
            var value = numberOfTokens * tokenPrice;
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: value });
        }).then((reciept) => {
            assert.equal(reciept.logs.length, 1);
            assert.equal(reciept.logs[0].event, 'Sell', 'should be the Sell event');
            assert.equal(reciept.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
            assert.equal(reciept.logs[0].args._amount, numberOfTokens, 'logs the number of tokens sold');
            return tokenSaleInstance.tokensSold();
        }).then((amount) => {
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then((balance) => {
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
            return tokenSaleInstance.buyTokens(1000000, { from: buyer, value: numberOfTokens * tokenPrice });
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than whats available');
        })
    });
    it('ends token sale', () => {
        return TSquareToken.deployed().then((instance) => {
            tokenInstance = instance;
            return AsixoTokenSale.deployed()
        }).then((instance) => {
            tokenSaleInstance = instance;
            return tokenSaleInstance.endSale({ from: buyer });
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, 'must be admin to end sale');
            return tokenSaleInstance.endSale({ from: admin });
        }).then((reciept) => {
            return tokenInstance.balanceOf(admin);
        }).then((balance) => {
            assert.equal(balance.toNumber(), 999990, 'returns all unsold Asixo tokens to admin');
            // Token price is reset when self destruct was called
            return web3.eth.getBalance(tokenSaleInstance.address);
            // assert.equal(balance, 0);
        }).then((balance) => {
            assert.equal(balance, 0, `resets the contract's balance to 0`);
        });
    });
});