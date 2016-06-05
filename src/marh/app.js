var Web3 = require('web3');
web3 = new Web3();
var bitcore = require('bitcore-lib');
var util = require('ethereumjs-util');
var Wallet = require('ethereumjs-wallet');
Parse = require('parse');
accounts = {};
contracts = localStorage.contracts ? JSON.parse(localStorage.contracts) : {};
accounts['primary'] = accounts['primary'] || {
    address: "0x73eb049fdef1a46ba8ce6f9383528f3e08b0600a",
    private: "150b99d7f4d926c0826f29899e7a3838129a21d0dbe424742817bce0bede2b0e"
}
if (!localStorage.accounts) {
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
else{
    accounts = JSON.parse(localStorage.accounts)
}

Parse.initialize('1', '');
Parse.serverURL = 'http://192.168.1.105:8080/parse';

Tx = require('ethereumjs-tx');
var HookedWeb3Provider = require("hooked-web3-provider");
var provider = new HookedWeb3Provider({
    host: "http://localhost:8555", //"http://127.0.0.1:8545",
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


var query = new Parse.Query('Contract');
query.select("abi", "name", 'bytecode');
query.find().then(function(results) {
    
    var contracts = {};
    for (var i = 0; i < results.length; i++) {
        var contract = results[i]
        contracts[contract.get('name')] = {
            abi: contract.get('abi'),
            name: contract.get('name'),
            bytecode: contract.get('bytecode')
        }
    }
    localStorage.contracts = JSON.stringify(contracts);
    contracts = contracts;

}, function(err) { console.error(err) })




//Load Modules
require('./modules/accounts');
