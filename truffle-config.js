module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 6721975,
      gasPrice: 20000000000
    }
  },

  contracts_directory: './contracts/',
  contracts_build_directory: './client/src/contracts/',

  mocha: {
    timeout: 100000
  },

  compilers: {
    solc: {
      version: "0.8.19",    // Sử dụng phiên bản ổn định
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};