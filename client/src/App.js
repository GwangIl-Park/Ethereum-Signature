import React, { Component } from "react";
import Validator from "./contracts/Validator.json";
import getWeb3 from "./getWeb3";

import "./App.css";

let deployedNetwork;
class App extends Component {
  state = { web3: null, accounts: null, contract: null };
  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      deployedNetwork = Validator.networks[networkId];
      const instance = new web3.eth.Contract(
        Validator.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  runExample = async () => {
    const { web3, accounts, contract } = this.state;
    const msgParams = 'message'
    let msgHash = await web3.utils.sha3(msgParams);
    alert(msgHash)
    let from = accounts[0];
    var params = [from, msgHash]
    var method = 'personal_sign'
    web3.currentProvider.send({
      method,
        params,
        from,
      }, async function (err, result) {
        const signature = result.result.substr(2); //remove 0x
        const r = '0x' + signature.slice(0, 64)
        const s = '0x' + signature.slice(64, 128)
        const v = '0x' + signature.slice(128, 130)
        let recoveredAddress;
        let resultVerify;

        await contract.methods.recoverAddress(msgHash, v, r, s).call({from:accounts[0]})
        .then(function(result){
          recoveredAddress = result;
        });

        await contract.methods.verify(accounts[0], msgHash, v, r, s).call({from:accounts[0]})
        .then(function(result){
          resultVerify = result;
        });
        alert("account : "+accounts[0]+"\nrecoveredAccount : "+recoveredAddress+"\nresult : "+resultVerify)
      }
    );
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div>account            : {this.state.accounts[0]}</div>
      </div>
    );
  }
}

export default App;