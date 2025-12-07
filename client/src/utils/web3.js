import Web3 from 'web3';
import MarketplaceContract from '../contracts/Marketplace.json';

let web3;
let marketplace;

export const initWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  }
  
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = MarketplaceContract.networks[networkId];
  
  marketplace = new web3.eth.Contract(
    MarketplaceContract.abi,
    deployedNetwork && deployedNetwork.address
  );
  
  return { web3, marketplace };
};

export const getAccounts = async () => {
  return await web3.eth.getAccounts();
};

export const registerUser = async (account) => {
  return await marketplace.methods.registerUser().send({ from: account });
};

export const listItem = async (name, description, price, account) => {
  const priceInWei = web3.utils.toWei(price.toString(), 'ether');
  return await marketplace.methods
    .listItem(name, description, priceInWei)
    .send({ from: account });
};

export const purchaseItem = async (itemId, account) => {
  return await marketplace.methods
    .purchaseItem(itemId)
    .send({ from: account });
};

export const getBalance = async (account) => {
  const balance = await marketplace.methods.getBalance().call({ from: account });
  return web3.utils.fromWei(balance, 'ether');
};

export const isRegistered = async (account) => {
  return await marketplace.methods.isRegistered().call({ from: account });
};