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
  let [votesPerCenter, setVotesPerCenter] = React.useState("");

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
    setVotesPerCenter("");
  }

  async function simulateVoting(){
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const votingSimulation = new ethers.Contract("0xfD736f01783A73ef469823Ee3d76Cab90168e0bb",contractAbi,signer);
    
    
    let gasPrice = await provider.getGasPrice();
    let tx = await votingSimulation.startVoting({gasLimit:"7500000",gasPrice:gasPrice});
    document.getElementById("simulateVoting").innerHTML = "Voting in progress...";
    await tx.wait();
    

    document.getElementById("simulateVoting").innerHTML = "Simulate Voting";
    
    
    setVoteReport("");
    setWinner("");
    setCenterVoteReport("");
    setPartiesVotes("");
    setVotesPerCenter("");
  }

  async function showTheWinner(){
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const votingSimulation = new ethers.Contract("0xfD736f01783A73ef469823Ee3d76Cab90168e0bb",contractAbi,signer);
    const voteWinner = await votingSimulation.viewWinner();
    await setWinner(voteWinner);
  }

  async function showVoteReport(){
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const votingSimulation = new ethers.Contract("0xfD736f01783A73ef469823Ee3d76Cab90168e0bb",contractAbi,signer);
    const theVoteReport = await votingSimulation.viewVotes();
   
    let allVotes = [];

    for (let i = 0; i<theVoteReport[0].length;i++){
      allVotes.push(parseInt(theVoteReport[0][i]));
    }

    let votingCenters = [];
   
    let receivedAddresses = new Array(100).fill("");

    for (let i=1; i<theVoteReport.length-1; i++){
      votingCenters[i] = [];
      for (let j=0; j<theVoteReport[i].length; j++){
       
        votingCenters[i].push([parseInt(allVotes[theVoteReport[i][j][1]]), parseInt(theVoteReport[i][j][1])])
        receivedAddresses[theVoteReport[i][j][1]] = (theVoteReport[i][j][3].toString())
      }
    }
    votingCenters.splice(0,1)


    let votesPerCenterPerParty = [];
    for (let i = 0; i<10; i++){
      votesPerCenterPerParty.push([0,0,0,0,0]);
    }

    let vote;
    for(let i =0; i<votingCenters.length; i++){
      
      for (let j=0; j<votingCenters[i].length; j++){
      vote = votingCenters[i][j][0];
      votesPerCenterPerParty[i][allVotes[votingCenters[i][j][1]]]++;
      }
    }
    

    let partyVotes = [];
    for (let i =0; i<5; i++){
      partyVotes.push(parseInt(theVoteReport[11][i][1]));
    }

    setPartiesVotes(partyVotes);
    setVoteReport(allVotes);
    setCenterVoteReport(votingCenters);
    setAddresses(receivedAddresses);
    setVotesPerCenter(votesPerCenterPerParty);
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
            return(<div style={{flexBasis:"20%"}}><h2>Voting Center №{index+1} - {center.length} votes</h2>
            <h3>Party №1 - {votesPerCenter[index][0]} votes</h3>
            <h3>Party №2 - {votesPerCenter[index][1]} votes</h3>
            <h3>Party №3 - {votesPerCenter[index][2]} votes</h3>
            <h3>Party №4 - {votesPerCenter[index][3]} votes</h3>
            <h3>Party №5 - {votesPerCenter[index][4]} votes</h3>
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
