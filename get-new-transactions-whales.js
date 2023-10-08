// const { Web3 } = require('web3');
// const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org:443'));
// // const getLastTransactions = async function() {
// //     const lastBlockNumber = await web3.eth.getBlockNumber();
// //     console.log('Last block number: ', lastBlockNumber);
    
// //     let block = await web3.eth.getBlock(lastBlockNumber);
    
// //     console.log('Last block hash: ', block.hash);
// //     console.log('Last block transactions: ', block.transactions);

// //     web3.eth.
// // }

// // getLastTransactions()

// async function getTransactionsByAccount(myaccount, startBlockNumber, endBlockNumber) {
//     if (endBlockNumber == null) {
//       endBlockNumber = await web3.eth.getBlockNumber();
//       console.log("Using endBlockNumber: " + endBlockNumber);
//     }
//     if (startBlockNumber == null) {
//       startBlockNumber = endBlockNumber - 1000n;
//       console.log("Using startBlockNumber: " + startBlockNumber);
//     }
//     console.log("Searching for transactions to/from account \"" + myaccount + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);
  
//     for (var i = startBlockNumber; i <= endBlockNumber; i++) {
//       if (i % 1000n == 0n) {
//         console.log("Searching block " + i);
//       }
//       var block = await web3.eth.getBlock(i, true);
//       if (block != null && block.transactions != null) {
//         block.transactions.forEach( function(e) {
//           if (myaccount == "*" || myaccount == e.from || myaccount == e.to) {
//             console.log("  tx hash          : " + e.hash + "\n"
//               + "   nonce           : " + e.nonce + "\n"
//               + "   blockHash       : " + e.blockHash + "\n"
//               + "   blockNumber     : " + e.blockNumber + "\n"
//               + "   transactionIndex: " + e.transactionIndex + "\n"
//               + "   from            : " + e.from + "\n" 
//               + "   to              : " + e.to + "\n"
//               + "   value           : " + e.value + "\n"
//               + "   time            : " + block.timestamp + " " + new Date(Number(block.timestamp * 1000n)).toGMTString() + "\n"
//               + "   gasPrice        : " + e.gasPrice + "\n"
//               + "   gas             : " + e.gas + "\n"
//               + "   input           : " + e.input);
//           }
//         })
//       }
//     }
//   }

// async function getLast(address) {
//     lastBlockNumber = await web3.eth.getBlockNumber()
//     getTransactionsByAccount(address, lastBlockNumber, lastBlockNumber);
// }

// getLast('0x13f4ea83d0bd40e75c8222255bc855a974568dd4')
  