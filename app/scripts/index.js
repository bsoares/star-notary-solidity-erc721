// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css';

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import StarNotaryArtifact from '../../build/contracts/StarNotary.json';

// StarNotary is our usable abstraction, which we'll use through the code below.
const StarNotary = contract(StarNotaryArtifact);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts;
let account;

const App = {
  contractInstance: null,

  start: function () {
    const self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    StarNotary.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(async function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.');
        return;
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.contractInstance = await StarNotary.deployed();
    })
  },

  setStatus: function (message) {
    const status = document.getElementById('status');
    status.innerHTML = message;
  },

  createStar: async function () {
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;

    await this.contractInstance.createStar(name, id, { from: account });

    App.setStatus("New Star Owner is " + account + ".");
  },

  getStar: async function () {
    const id = document.getElementById("get_starId").value;
    console.log('[getStar] id:', id);

    const starName = await this.contractInstance.lookUptokenIdToStarInfo(id);
    if (starName) {
      App.setStatus('Star #' + id + ' name is: ' + starName + '.');
    } else {
      App.setStatus('Star not found');
    }
  },

  exchangeStars: async function () {
    const star1 = document.getElementById("starId_1").value;
    console.log('[exchangeStars] star1:', star1);

    const star2 = document.getElementById("starId_2").value;
    console.log('[exchangeStars] star2:', star2);

    await this.contractInstance.exchangeStars(star1, star2, { from: account });
  },

  transferStar: async function () {
    const starId = document.getElementById("transfer_starId").value;
    console.log('[exchangeStars] starId:', starId);

    const toAddress = document.getElementById("transfer_toAddress").value;
    console.log('[exchangeStars] toAddress:', toAddress);

    await this.contractInstance.transferStar(starId, toAddress, { from: account });
  },
}

window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:9545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'))
  }

  App.start()
})
