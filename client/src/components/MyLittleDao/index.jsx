import useEth from "../../contexts/EthContext/useEth";
import NoticeNoArtifact from "./NoticeNoArtifact";
import NoticeWrongNetwork from "./NoticeWrongNetwork";
import { Container } from '@chakra-ui/react';

function MyLittleDAO() {
  const { state } = useEth();

  return (
    <div className="MyLittleDAO">
      <Container maxW="4xl">
      {
        !state.artifact ? <NoticeNoArtifact /> :
          !state.contract ? <NoticeWrongNetwork /> :
            <span> HOME </span>
      }
      </Container>
    </div>
  );
}

export default MyLittleDAO;
