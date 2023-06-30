import { useEffect, useState } from 'react';
import './App.css';
import contract from './contracts/NUSD.json';
import {ethers} from 'ethers';

const contractAddress = "0xB1bFde9E74B939d882cf95a5930475b8F83AE19A";
const abi = contract.abi;


function App() {

  const [amount,setAmount] = useState(0)
  const [redeemAmount,setRedeemAmount] = useState(0)
  const [currentAccount, setCurrentAccount] = useState(null);

  const [balance, updateBalance] = useState(0);

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }

  async function fetchBalance() {
    if (typeof window.ethereum !== "undefined") {
      await connectWalletHandler();
      
      //ethereum is usable get reference to the contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const accounts = await provider.send("eth_requestAccounts", []);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      console.log(accounts)

      try {
          let data = await contract.balanceOf(accounts[0]);
          data=parseInt(data)
          console.log(data)
          updateBalance(data)
          console.log("Data: ", data);
      } catch (e) {
          console.log("Err: ", e)
      }
    }
}

fetchBalance()

  const [price, setPrice] = useState(0);

  async function fetchPrice() {
    if (typeof window.ethereum !== "undefined") {
      await connectWalletHandler();
      
      //ethereum is usable get reference to the contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);

      try {
          let data = await contract.getLatestData();
          data=parseInt(data)
          console.log(data)
          setPrice(data)

          console.log("Data: ", data);
      } catch (e) {
          console.log("Err: ", e)
      }
    }
}

fetchPrice()

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  }



  const depositHandler = async (e) => {
    try {

      e.preventDefault()

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nUSDContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Initialize payment");
        let depoTxn = await nUSDContract.deposit( { value: ethers.utils.parseEther(amount) });
        console.log(depoTxn)

        console.log("Please wait");
        await depoTxn.wait();

        console.log(`Deposit Complete`);
        fetchBalance()

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const redeemHandler = async (e) => {
    try {

      e.preventDefault()

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nUSDContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Initialize payment");
        let redeemString = redeemAmount*10**18
        let approveTxn = await nUSDContract.approve(contractAddress,redeemString.toString());
        console.log("Please wait");
        await approveTxn.wait();


        let redeemTxn = await nUSDContract.redeem(redeemString.toString());
        console.log(redeemTxn)

        console.log("Please wait");
        await redeemTxn.wait();

        console.log(`Deposit Complete`);
        fetchBalance()

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className=' flex flex-col justify-center cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const DepositButton = () => {
    return (
      <button onClick={depositHandler} >
        <section class=" overflow-hidden">
    <div class="">
        {/* <div class="relative flex-1 hidden w-0 overflow-hidden lg:block">
            <img class="absolute inset-0 object-cover w-full h-full bg-black" src="/assets/images/placeholders/rectangleWide.png" alt="">
        </div> */}
        <div class="flex flex-col justify-center flex-1 px-4 py-12 overflow-hidden sm:px-6 lg:flex-none lg:px-20 xl:px-24">
            <div class="  mx-auto lg:w-96">
                <div>
                    <a  class="text-blue-600 text-medium">Balance: {balance/10**18} n$</a>
                    <h2 class="mt-6 text-3xl font-extrabold text-neutral-600">Deposit</h2>
                </div>

                <div class="mt-8">
                    <div class="mt-6">
                        <form  class="space-y-6">
                            <div>
                                <label for="email" class="block text-sm font-medium text-neutral-600"> Amount to deposit </label>
                                <div class="mt-1">
                                    <input id="email" name="email" value={amount} onChange={(e)=>{setAmount(e.target.value)}}  placeholder="1 ETH" class="block w-full px-5 py-3 text-base text-neutral-600 placeholder-gray-300 transition duration-500 ease-in-out transform border border-transparent rounded-lg bg-gray-200 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300"/>
                                </div>
                            </div>

                            <div class="space-y-1">
                                <label for="password" class="block text-sm font-medium text-neutral-600"> Recieved nUSD </label>
                                <div class="mt-1">
                                    <input id="password" name="password" value={amount*(price/100000000)/2} placeholder="Your Password" class="block w-full px-5 py-3 text-base text-neutral-600 placeholder-white-300 transition duration-500 ease-in-out transform border border-transparent rounded-lg bg-blue-200 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300"/>
                                </div>
                            </div>

                            

                            <div>
                                <button onClick={(e)=>{depositHandler(e)}} class="flex items-center justify-center w-full px-10 py-4 text-base font-medium text-center text-white transition duration-500 ease-in-out transform bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Deposit</button>
                            </div>
                        </form>
                     
                    </div>
                </div>
            </div>
            <div class=" mx-auto lg:w-96">
                <div>
                    <h2 class="mt-6 text-3xl font-extrabold text-neutral-600">Redeem</h2>
                </div>

                <div class="mt-8">
                    <div class="mt-6">
                        <form action="#" method="POST" class="space-y-6">
                            <div>
                                <label for="email" class="block text-sm font-medium text-neutral-600"> Amount to redeem</label>
                                <div class="mt-1">
                                    <input id="email" name="email" value={redeemAmount} onChange={(e)=>{setRedeemAmount(e.target.value)}}  placeholder="10 nUSD" class="block w-full px-5 py-3 text-base text-neutral-600 placeholder-gray-300 transition duration-500 ease-in-out transform border border-transparent rounded-lg bg-gray-200 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300"/>
                                </div>
                            </div>

                            <div class="space-y-1">
                                <label for="password" class="block text-sm font-medium text-neutral-600"> Recieved ETH </label>
                                <div class="mt-1">
                                    <input id="password" name="password" value={(redeemAmount/(price/100000000))/2} onChange={(e)=>{setRedeemAmount(e.target.value)}}  placeholder="0.1 ETH" class="block w-full px-5 py-3 text-base text-neutral-600 placeholder-white-300 transition duration-500 ease-in-out transform border border-transparent rounded-lg bg-blue-200 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300"/>
                                </div>
                            </div>

                            

                            <div>
                                <button onClick={(e)=>{redeemHandler(e)}} class="flex items-center justify-center w-full px-10 py-4 text-base font-medium text-center text-white transition duration-500 ease-in-out transform bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Redeem</button>
                            </div>
                            <br></br>
                            <a href='https://goerli.etherscan.io/address/0xB1bFde9E74B939d882cf95a5930475b8F83AE19A' class="text-blue-600 text-small">Address:0xB1bFde9E74B939d882cf95a5930475b8F83AE19A</a>
                        </form>
                     
                    </div>
                </div>
            </div>
        </div>

    </div>
</section>
      </button>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <div className='main-app'>
      <div>
        {currentAccount ? DepositButton() : connectWalletButton()}
      </div>
      
    </div>
  )
}

export default App;
