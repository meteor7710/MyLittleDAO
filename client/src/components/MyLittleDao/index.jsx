import useEth from "../../contexts/EthContext/useEth";
import NoticeNoArtifact from "./NoticeNoArtifact";
import NoticeWrongNetwork from "./NoticeWrongNetwork";
import Address from "../Address/AddressConnected";
import MainTabs from "../Tabs/MainTabs"
import { Container, Box } from '@chakra-ui/react';
import { useState,useEffect } from "react";

function MyLittleDAO() {
  const { state } = useEth();
  const { state: { accounts } } = useEth();
  const [currentAddress, setCurrentAddress] = useState("");


  useEffect(() => {
    (async function () {
      if (accounts) {
        setCurrentAddress(accounts[0])
      }
    })();
  }, [accounts])


  const dapp =
    <>
        <MainTabs />
    </>;

  return (
    <div className="MyLittleDAO">
      <Container maxW="4xl">
      <Address currentAddress={currentAddress}/>
      {
        !state.artifact ? <NoticeNoArtifact /> :
          !state.contract ? <NoticeWrongNetwork /> :
          <Box>{dapp}</Box>
      }
      </Container>
    </div>
  );
}

export default MyLittleDAO;
