var Web3 = require('web3');
web3 = new Web3();
var bitcore = require('bitcore-lib');
var util = require('ethereumjs-util');
var Wallet = require('ethereumjs-wallet');
var contract = require('./contracts/test.sol')
accounts = localStorage.accounts ? JSON.parse(localStorage.accounts) : {};
accounts['primary'] = accounts['primary'] || {
    address: "0x73eb049fdef1a46ba8ce6f9383528f3e08b0600a",
    private: "150b99d7f4d926c0826f29899e7a3838129a21d0dbe424742817bce0bede2b0e"
}
if (!accounts['user']) {
    for (var i = 3; i >= 0; i--) {
        var privKey = new bitcore.PrivateKey().toString();
        var userkey = new Buffer(privKey, 'hex')
        var wallet = Wallet.fromPrivateKey(userkey)
        accounts['user' + i] = {
            address: wallet.getAddressString(),
            private: privKey
        }

    }


    localStorage.accounts = JSON.stringify(accounts);
}


var Tx = require('ethereumjs-tx');
var HookedWeb3Provider = require("hooked-web3-provider");
var provider = new HookedWeb3Provider({
    host: "http://localhost:8545", //"http://127.0.0.1:8545",
    transaction_signer: {
        hasAddress: function(address, callback) {
            callback(null, true);
        },
        signTransaction: function(txParams, callback) {

            function strip0x(input) {
                if (typeof(input) !== 'string') {
                    return input;
                } else if (input.length >= 2 && input.slice(0, 2) === '0x') {
                    return input.slice(2);
                } else {
                    return input;
                }
            }

            function add0x(input) {
                if (typeof(input) !== 'string') {
                    return input;
                } else if (input.length < 2 || input.slice(0, 2) !== '0x') {
                    return '0x' + input;
                } else {
                    return input;
                }
            }

            console.log(txParams.fromObj.address);
            var ethjsTxParams = {};
            ethjsTxParams.from = add0x(txParams.fromObj.address);
            ethjsTxParams.to = add0x(txParams.to);
            ethjsTxParams.gasLimit = add0x(txParams.gas);
            ethjsTxParams.gasPrice = add0x(txParams.gasPrice);
            ethjsTxParams.nonce = add0x(txParams.nonce || new Date().getTime() + parseInt(Math.random() * 100));
            ethjsTxParams.value = add0x(txParams.value);
            ethjsTxParams.data = add0x(txParams.data);

            var tx = new Tx(ethjsTxParams);
            tx.sign(new Buffer(txParams.fromObj.private, 'hex'));
            var serializedTx = '0x' + tx.serialize().toString('hex');

            callback(null, serializedTx);
        }
    }
});


web3.setProvider(provider);

var accountKeys = Object.keys(accounts);
for (key in accountKeys) {
    console.log(accountKeys[key]);
    console.log();
    if (accountKeys[key] == "primary") continue;

    console.log("Paid to", accounts[accountKeys[key]].address);
    web3.eth.sendTransaction({
        from: accounts.primary.address,
        fromObj: accounts.primary,
        to: accounts[accountKeys[key]].address,
        value: web3.toWei(2, 'ether'),
        gasPrice: web3.toWei(7e11, 'wei'),
        gas: 21000
    }, function(err, result) {
        if (err != null) {
            console.log(err);
            console.log("ERROR: Transaction didn't go through. See console.");
        } else {
            console.log("Transaction Successful!");
            console.log(result);
        }
    });
}

/*
var solc = require('solc');
var input = contract;
var output = solc.compile(input, 1); // 1 activates the optimiser
for (var contractName in output.contracts) {
    // code and ABI that are needed by web3
    console.log(contractName + ': ' + output.contracts[contractName].bytecode);
    console.log(contractName + '; ' + JSON.parse(output.contracts[contractName].interface));
}
*/


/*var primary = web3.eth.accounts[0];
console.log(primary)
var MyContract = web3.eth.contract(JSON.parse(output.contracts["MyToken"].interface));*/
var solc = require('solc');
var input = contract;
var output = solc.compile(input, 1); // 1 activates the optimiser
for (var contractName in output.contracts) {
    // code and ABI that are needed by web3
    console.log(contractName + ': ' + output.contracts[contractName].bytecode);
    console.log(contractName + '; ' + JSON.parse(output.contracts[contractName].interface));
}



console.log(output.contracts["MyToken"].interface)
var MyContract = web3.eth.contract(JSON.parse('[{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"inputs":[],"type":"constructor"}]'));

MyContract.new({
    data: output.contracts["MyToken"].bytecode,
    gas: 3e6,
    fromObj: accounts.user0,
    from: accounts.user0.address
}, function(err, myContract) {
    if (err) throw err.message;
    if (!err) {
        // NOTE: The callback will fire twice!
        // Once the contract has the transactionHash property set and once its deployed on an address.

        // e.g. check tx hash on the first call (transaction send)
        if (!myContract.address) {
            console.log(myContract.transactionHash) // The hash of the transaction, which deploys the contract

            // check address on the second call (contract deployed)
        } else {
            console.log(myContract.address) // the contract address
        }

        // Note that the returned "myContractReturned" === "myContract",
        // so the returned "myContractReturned" object will also get the address set.
    }
})
