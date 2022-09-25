import logo from './logo.svg';
import './App.css';
import { ethers } from 'ethers';
import contractAbi from "./VotingSimulationABI.json";
import React from 'react';

function App() {
  document.title = "Voting Simulation"
  let [winner, setWinner] = React.useState("");
  let [voteReport, setVoteReport] = React.useState("");
  let [CenterVoteReport, setCenterVoteReport] = React.useState("");
  let [partiesVotes, setPartiesVotes] = React.useState("");
  let [addresses, setAddresses] = React.useState("");

  async function generateVoters(){
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const votingSimulation = new ethers.Contract("0xF05217Ffe7BAF3184FE4f3a46A2ec34693c1Dafa",contractAbi,signer);

    let gasPrice = await provider.getGasPrice();

    let tx = await votingSimulation.createVoters({gasLimit:"4000000", gasPrice:gasPrice});
    document.getElementById("generateVoters").innerHTML = "Generating voters...";
    await tx.wait();

    document.getElementById("generateVoters").innerHTML = "Generate Voters";
    
    setVoteReport("");
    setWinner("");
    setCenterVoteReport("");
    setPartiesVotes("");
  }

  async function simulateVoting(){
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const votingSimulation = new ethers.Contract("0xF05217Ffe7BAF3184FE4f3a46A2ec34693c1Dafa",contractAbi,signer);
    
    
    let gasPrice = await provider.getGasPrice();
    let tx = await votingSimulation.startVoting({gasLimit:"7500000",gasPrice:gasPrice});
    document.getElementById("simulateVoting").innerHTML = "Voting in progress...";
    await tx.wait();
    

    document.getElementById("simulateVoting").innerHTML = "Simulate Voting";
    
    
    setVoteReport("");
    setWinner("");
    setCenterVoteReport("");
    setPartiesVotes("");
  }

  async function showTheWinner(){
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const votingSimulation = new ethers.Contract("0xF05217Ffe7BAF3184FE4f3a46A2ec34693c1Dafa",contractAbi,signer);
    const voteWinner = await votingSimulation.viewWinner();
    await setWinner(voteWinner);
  }

  async function showVoteReport(){
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const votingSimulation = new ethers.Contract("0xF05217Ffe7BAF3184FE4f3a46A2ec34693c1Dafa",contractAbi,signer);
    const theVoteReport = await votingSimulation.viewVotes();
   
    let allVotes = [];

    for (let i = 0; i<theVoteReport[0].length;i++){
      allVotes.push(parseInt(theVoteReport[0][i]));
    }

    let votingCenters = [];
    let receivedAddresses = new Array(100).fill("");;

    for (let i=1; i<theVoteReport.length-1; i++){
      votingCenters[i] = [];
      for (let j=0; j<theVoteReport[i].length; j++){
       
        votingCenters[i].push([parseInt(theVoteReport[i][j][0]), parseInt(theVoteReport[i][j][1])])
        receivedAddresses[theVoteReport[i][j][1]] = (theVoteReport[i][j][3].toString())
      
      }
    }
    votingCenters.splice(0,1)
    

    let partyVotes = [];
    for (let i =0; i<5; i++){
      partyVotes.push(parseInt(theVoteReport[11][i][1]));
    }

    setPartiesVotes(partyVotes);
    setVoteReport(allVotes);
    setCenterVoteReport(votingCenters);
    setAddresses(receivedAddresses);
    
  }

  return (
    <div className="App">
      <h1>Voting Simulation</h1>
      
      <button id="generateVoters" className='button-59' onClick={generateVoters}>Generate Voters</button>
      
      <button id="simulateVoting" className='button-59' onClick={simulateVoting}>Simulate Voting</button>
     
      <button className='button-59' onClick={showTheWinner}>Show The Winner</button>
      
      <button className='button-59' onClick={showVoteReport}>Show Vote Report</button>

      <div>
        {winner == "" ? 
        <></>
        :
        <h1>The winner is organization №{parseInt(winner[0])+1} with {parseInt(winner[1])} votes!</h1>
        }
      </div>

        <div>
          {partiesVotes=="" ? 
          <></>:
          <div>
          <h1>Party Votes</h1>
          <div style={{display:'flex', flexWrap:"wrap"}}>
            {partiesVotes.map((votes,index)=>{
              return(
              <h2 style={{flexBasis:"20%"}}>№{index+1} - {votes} votes</h2>
              )
            })}
            </div>
          </div>
          }
        </div>

      <div>
        {voteReport=="" ? 
        <></>
        :
        <>
        <h1>Voting report:</h1>
        <div style={{display:'flex', flexWrap:"wrap"}}>
        {
          voteReport.map((vote, index)=>{
            return(<p style={{flexBasis:"10%"}}>№{index+1} {addresses[index].substring(0,6)}...{addresses[index].substring(38,44)} - voted for {vote+1}</p>)
          })
        }
        </div>
        </>
        }

        {CenterVoteReport== "" ?  <></>
        :<div>
        <h1>Voting centers:</h1>
        <div style={{display:"flex", flexWrap:"wrap"}}>
        {
          CenterVoteReport.map((center, index)=>{
            return(<div style={{flexBasis:"20%"}}><h2>Voting Center №{index+1}</h2>
              {center.map((voter,index)=>{
                return(<p>№{voter[1]+1} {addresses[voter[1]].substring(0,6)}...{addresses[voter[1]].substring(38,44)} - voted for {voter[0]+1}</p>)
              })}
            </div>)
            
          })
        }
        </div>
        </div>}
      </div>

    </div>
  );
}

export default App;
