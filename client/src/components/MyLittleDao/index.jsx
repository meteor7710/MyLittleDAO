import useEth from "../../contexts/EthContext/useEth";
import NoticeNoArtifact from "../Demo/NoticeNoArtifact";
import NoticeWrongNetwork from "./NoticeWrongNetwork";

function MyLittleDAO() {
  const { state } = useEth();

  return (
    <div className="MyLittleDAO">
      {
        !state.artifact ? <NoticeNoArtifact /> :
          !state.contract ? <NoticeWrongNetwork /> :
            <span> HOME </span>
      }
    </div>
  );
}

export default MyLittleDAO;
