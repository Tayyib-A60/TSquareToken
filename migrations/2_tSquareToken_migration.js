const TSquareToken = artifacts.require("./TSquareToken.sol");

module.exports = function(deployer) {
  deployer.deploy(TSquareToken);
};
