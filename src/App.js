import "./App.css";
import React, { useState, useEffect, useReducer, useContext } from "react";
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { getAddress } from "ethers";
import PhoneNum from "./res/PhoneNum.png";
import Ilustration from "./res/hero-img.png"
import OperationsPage from "./components/operations";
import { ChakraProvider } from "@chakra-ui/react";
import { ContractAddress } from './config.js';
import ContractAbi from './utils/Contract.json';
import { Appcontext } from "./components/context";


function App() {
  const { changeID, setChangeID, changeStatus, setChangeStatus } = useContext(Appcontext);
  const [currentAccount, setCurrentAccount] = useState(""); //fetched from metamask
  const [correctNetwork, setCorrectNetwork] = useState(false); //fetched from metamas
  const [operations, setOperations] = useState([]); //fetched from smart contract
  const [validatedOperations, setValidatedOperations] = useState([]); //fetched from smart contract
  const [whitelisted, setWhiteListed] = useState(false); //fetched from smart contract
  //Ethereum Wallet Connector
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Metamask Not Found ! Get MetaMask and Try Again.");
        return;
      }

      let chainId = await ethereum.request({ method: "eth_chainId" });
      const EthereumChainId = "0xaa36a7";
      if (chainId !== EthereumChainId) {
        alert("Please Connect to Ethereum Testnet");
        return;
      } else {
        setCorrectNetwork(true);
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  function copyPhoneNumberToClipboard() {
    const phoneNumber = "+12707704034";
    navigator.clipboard.writeText(phoneNumber)
      .then(() => {
        window.alert("Copied phone number to clipboard!");
      })
      .catch((error) => {
        window.alert("Could not copy phone number to clipboard.");
        console.error(error);
      });
  }

  function openInNewTab() {
    var win = window.open('https://metamask.io', '_blank');
    win.focus();
  }

  const getEmergencies = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        //setting up provider
        const provider = new Web3Provider(ethereum);
        const signer = provider.getSigner();
        const MyContract = new ethers.Contract(ContractAddress, ContractAbi.abi, signer);
        //calling the smart contract
        let Em_Data = await MyContract.getOperations();
        const formattedOperations = Em_Data.map((operationData) => {
          return {
            id: parseInt(operationData.id),
            data: operationData.data,
            status: parseInt(operationData.status),
          };
        });

        const res = formattedOperations.map((operationObject) => {
          let td = (operationObject.data).replace(/'/g, '"')
          console.log(td);
          let temp = JSON.parse(td);
          return {
            id: operationObject.id,
            name: temp.name,
            location: temp.location || temp.Location,
            priority: temp.priority,
            attention: temp.attention,
            callerNumber: temp.caller_number,
            time: temp.time,
            status: operationObject.status,
            transcript: temp.transcription || "404"
          };
        });
        setOperations(res);
        console.log(operations);
      }
      else {
        console.log('Ethereum object not found');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getWhitelisted = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        //setting up provider
        const provider = new Web3Provider(ethereum);
        const signer = provider.getSigner();
        const MyContract = new ethers.Contract(ContractAddress, ContractAbi.abi, signer);
        //calling the smart contract
        let wl_data = await MyContract.isWhiteListed();
        setWhiteListed(wl_data);
        console.log(whitelisted);
      }
      else {
        console.log('Ethereum object not found');
      }
    } catch (error) {
      console.log(error);
    }
  }


  useEffect(() => {
    if (changeID !== false) {
      const updateStatus = async () => {
        console.log(changeID, changeStatus);
        try {
          const { ethereum } = window;
          if (ethereum) {
            //setting up provider
            const provider = new Web3Provider(ethereum);
            const signer = provider.getSigner();
            const MyContract = new ethers.Contract(ContractAddress, ContractAbi.abi, signer);
            //calling the smart contract
            MyContract.setStatus(changeID, changeStatus).then(
              response => {
                console.log('Response : ', response);
                getEmergencies();
              }
            ).catch(err => {
              console.log(err);
            });

          }
          else {
            console.log('Ethereum object not found');
          }
        } catch (error) {
          console.log(error);
        }
      }
      updateStatus();
    }
  }, [changeID, changeStatus])

  useEffect(() => {
    connectWallet();
    getEmergencies();
    getWhitelisted();
  }, [connectWallet, getEmergencies, currentAccount, getWhitelisted]);


  return (
    <div className="App">
      {currentAccount === "" ? (
        <div className="ConnectWallet">
          <div className="cwTop">
            <img
              src={PhoneNum}
              alt="+12707704034"
              className="NumBtn"
              onClick={copyPhoneNumberToClipboard}
            ></img>
          </div>
          <div className="cwBottom">
            <div className="cwBottomLeft">
              <div className="cwBottomLeftInner">
                <div className="cwBottomLeftHead">Smart Rescue</div>
                <div className="cwBottomLeftBody">
                  Smart Rescue system lets callers talk to AI if there are no available emergency helpline operators, grading them on the scale of how important their call is based on the keywords and recording their location. While the responses are being gathered, it will prioritize their call and hand over the call transcript to the emergency handlers.
                </div>
                <div className="cwBottomLeftBtn">
                  <button onClick={connectWallet} className="cwbtn">Connect Wallet</button>
                  <p className="cwLink" onClick={openInNewTab}>Get Metamask Wallet</p>
                </div>
              </div>
            </div>
            <div className="cwBottomRight">
              <img src={Ilustration} alt="illustration"></img>
            </div>
          </div>
        </div>
      ) : currentAccount === "" ? (
        <div
          className="flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            fontSize: "26px",
            width: "100%",
            height: "100vh",
          }}
        >
          <div>-----------------------------------------</div>
          <div>Please connect to the Ethereum Testnet</div>
          <div>and reload the page</div>
          <div>-----------------------------------------</div>
        </div>
      ) : !whitelisted ? ( 
        <div
          className="flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            fontSize: "26px",
            width: "100%",
            height: "100vh",
          }}
        >
          <img
              src={PhoneNum}
              alt="+12707704034"
              className="NumBtn"
              onClick={copyPhoneNumberToClipboard}
            ></img>
          <div>-----------------------------------------</div>
          <div>Looks Like You are not WhiteListed, Only authorised <b>Smart Rescue</b> Team Members are allowed to access this page.</div>
          <div>Contact Us to get your wallet address added to whitelist</div>
          <div>-----------------------------------------</div>
          <div style={{fontWeight: "normal",
            fontSize: "18px"}}>The emergencies of people is an important data and needs to be protected, You trust us with your emergecy info, and we keep your trust. Only authorised people can see your data.</div>
        </div>
      ) : (
        <div className="Main">
          <ChakraProvider>
            <OperationsPage operationsData={operations} />
          </ChakraProvider>
        </div>
      )

      }
    </div>
  );
}

export default App;
