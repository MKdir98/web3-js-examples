const networkUrl = "https://bsc.getblock.io/a4a201b0-028e-4d32-b79a-9ee1632f1969/mainnet/";

const { Web3 } = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(networkUrl))

async function find() {
    console.log(await web3.eth.getPendingTransactions());
}

find();
