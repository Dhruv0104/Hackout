// const { ethers } = require('ethers');
// const wallet = ethers.Wallet.createRandom();
// console.log(wallet.address); // wallet address
// console.log(wallet.privateKey); // private key (store securely!)

const { ethers } = require('ethers');

// Connect to Sepolia
const provider = new ethers.JsonRpcProvider(
	'https://sepolia.infura.io/v3/cd24b306091a446bbadb84099af9e33c'
);

async function main() {
	const balance = await provider.getBalance('0x102fa63eCEF7fcE38a9259AE9B7789b46AEE88e2');
	console.log('Balance in Wei:', balance.toString());
	console.log('Balance in ETH:', ethers.formatEther(balance));
}

main();
