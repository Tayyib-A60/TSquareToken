const TSquareToken = artifacts.require("./TSquareToken.sol");
const AsixoTokenSale = artifacts.require("./AsixoTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(TSquareToken, 1000000).then(function() {
    return deployer.deploy(AsixoTokenSale, TSquareToken.address, 1000000000000);
  });
};
