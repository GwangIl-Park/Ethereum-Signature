const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"))

const Validator = require("./build/contracts/Validator.json")
const privateKey = '3e1dd3360af05d4495a562912fa774c07ebcb5fb1cd33e52a0c064673a2fa8c3'

let runProc = async function()
{
    let account = web3.eth.accounts.privateKeyToAccount(privateKey);
    let address = account.address
    console.log("privateKey :           ",privateKey)
    console.log("address :              ", address);

    const networkId = await web3.eth.net.getId();
    const networkData = Validator.networks[networkId];
    let contract = new web3.eth.Contract(Validator.abi, networkData.address);

    const message = web3.utils.sha3('message');

    console.log(message)

    let sigatureData = web3.eth.accounts.sign(message, privateKey);

    let signature = sigatureData.signature;
    let v = sigatureData.v;
    let r = sigatureData.r;
    let s = sigatureData.s;

    /*signature = signature.substr(2); //remove 0x
    const r2 = '0x' + signature.slice(0, 64)
    const s2 = '0x' + signature.slice(64, 128)
    const v2 = '0x' + signature.slice(128, 130)*/

    await contract.methods.recoverAddress(message, v, r, s).call({from:account.address})
    .then(function(result){
        console.log("recovered address :    ",result)
    })

    await contract.methods.verify(account.address, message, v, r, s).call({from:account.address})
    .then(function(result){
        console.log("verify :               ",result)
    })
}
runProc();