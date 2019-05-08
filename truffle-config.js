const HDWalletProvider = require("truffle-hdwallet-provider");

// require('dotenv').config();
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
  // testnets
    // properties
    // network_id: identifier for network based on ethereum blockchain. Find out more at https://github.com/ethereumbook/ethereumbook/issues/110
    // gas: gas limit
    // gasPrice: gas price in gwei
    ropsten: {
      provider: () => new HDWalletProvider('half few poem mix weasel dice small infant fury tribe forum lounge', "https://ropsten.infura.io/v3/" + 'de7b00cce99946f19819ab746463b8cd'),
      network_id: 3,
      gas: 3000000,
      gasPrice: 10000000000
    },
    kovan: {
      provider: () => new HDWalletProvider('half few poem mix weasel dice small infant fury tribe forum lounge', "https://kovan.infura.io/v3/" + 'de7b00cce99946f19819ab746463b8cd'),
      network_id: 42,
      gas: 3000000,
      gasPrice: 10000000000
    },
    rinkeby: {
      provider: () => new HDWalletProvider('half few poem mix weasel dice small infant fury tribe forum lounge', "https://rinkeby.infura.io/v3/" + 'de7b00cce99946f19819ab746463b8cd'),
      network_id: 4,
      gas: 3000000,
      gasPrice: 10000000000
    },
    // main ethereum network(mainnet)
    main: {
      provider: () => new HDWalletProvider('half few poem mix weasel dice small infant fury tribe forum lounge', "https://mainnet.infura.io/v3/" + 'de7b00cce99946f19819ab746463b8cd'),
      network_id: 1,
      gas: 3000000,
      gasPrice: 10000000000
    }
  }
};
