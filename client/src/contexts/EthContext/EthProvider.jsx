import React, { useReducer, useCallback, useEffect, useState } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";
import { Button, Box, Flex, Heading, Text, Image } from '@chakra-ui/react';


function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [account, setAccount] = useState("");

  const init = useCallback(
    async artifact => {
      if (artifact) {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();
        const { abi } = artifact;
        let address, contract;
        try {
          address = artifact.networks[networkID].address;
          contract = new web3.eth.Contract(abi, address);
        } catch (err) {
          console.error(err);
        }
        dispatch({
          type: actions.init,
          data: { artifact, web3, accounts, networkID, contract }
        });
        setAccount(accounts[0]);
      }
    }, []);

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifact = require("../../contracts/MyLittleDAO.json");
        init(artifact);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifact);
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);

  const connectToMetaMask = async () => {
    try {
      await window.ethereum.enable();
      const artifact = require("../../contracts/MyLittleDAO.json");
      init(artifact);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <EthContext.Provider value={{
      state,
      dispatch
    }}> 
      <header>
        <Box p="10px" background="gray.200">
        <Flex justifyContent="space-between" alignItems="center" width="100%">
            <Box width="30%"><Image src='https://i.seadn.io/gcs/files/e7b82ed7b42b2eabf32d463fe5d361bd.png?auto=format&w=1000' alt='Icone' borderRadius='full'  boxSize='75px' /></Box>
            <Heading as='h1' size='lg'>MyLittleDAO</Heading>
            {
            account ? <Text width="30%" ></Text> :
              <Button width="30%" colorScheme="orange" onClick={connectToMetaMask}>Connect to MetaMask</Button>
          }
        </Flex>
        </Box>
      </header>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
