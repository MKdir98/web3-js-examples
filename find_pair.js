var fs = require('fs')
const { Web3 } = require('web3');
var factoryAddress = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"
var web3 = new Web3(new Web3.providers.HttpProvider('https://bscrpc.com'))

async function findPair() {
    var contract = new web3.eth.Contract(JSON.parse(fs.readFileSync('factory-abi.json', 'utf-8')), factoryAddress);
    console.log(await contract.getPastEvents());
}

findPair();
