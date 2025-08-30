const { ethers } = require('ethers');
const fs = require('fs');

// Connect to local blockchain (Ganache/Hardhat)
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

// Use deployer account (from Ganache or generated private key)
const deployer = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);

// Compile your subsidy contract first -> get ABI + Bytecode
const abi = JSON.parse(fs.readFileSync('./Subsidy.abi'));
const bytecode = fs.readFileSync('./Subsidy.bin', 'utf8');

async function deploy() {
	const factory = new ethers.ContractFactory(abi, bytecode, deployer);
	const contract = await factory.deploy(); // deploy
	await contract.waitForDeployment();

	console.log('Contract Address:', await contract.getAddress());
}

deploy();
