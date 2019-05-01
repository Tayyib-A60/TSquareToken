var TSquareToken = artifacts.require("./TSquareToken.sol");

contract('TSquareToken', function() {
    it('sets the total supply', function() {
        return TSquareToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            console.log('total', totalSupply.toString());
            assert.equal(totalSupply.toString(),1000000, 'sets the total supply to 1 million');
        })
    })
})