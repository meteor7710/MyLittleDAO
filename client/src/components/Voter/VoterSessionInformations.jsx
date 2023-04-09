import { Box, Heading, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { useState, useEffect } from "react";
import useEth from "../../contexts/EthContext/useEth";

function VoterSessionInformations({ voterSessionSelected, addressToWhitelistLog,workflowStatusLog }) {

    const { state: { contract, accounts } } = useEth();
    const [voterSessionInfos, setVoterSessionInfos] = useState("");
    

    //show session create where uses is admin
    useEffect(() => {
        (async function () {

            if (voterSessionSelected !== "") {
                const session = await contract.methods.getSession((voterSessionSelected)).call({ from: accounts[0] });

                let sessionVoteType;
                switch (session.voteType) {
                    case "0":
                        sessionVoteType = "Simple Vote";
                        break;
                    case "1":
                        sessionVoteType = "Pot Vote";
                        break;
                    case "2":
                        sessionVoteType = "Admin Vote";
                        break;
                    default:
                }

                let sessionWorkflowStatus;
                switch (session.workflowStatus) {
                    case "0":
                        sessionWorkflowStatus = "Registering Voters";
                        break;
                    case "1":
                        sessionWorkflowStatus = "Proposals Registration Started";
                        break;
                    case "2":
                        sessionWorkflowStatus = "Proposals Registration Ended";
                        break;
                    case "3":
                        sessionWorkflowStatus = "Voting Session Started";
                        break;
                    case "4":
                        sessionWorkflowStatus = "Voting Session Ended";
                        break;
                    case "5":
                        sessionWorkflowStatus = "Votes Tallied";
                        break;
                    default:
                }

                const sessionsInfos =
                    <>
                        <Text my="5px"> Session ID : {voterSessionSelected}</Text>
                        <Text my="5px"> Session Title: {session.title}</Text>
                        <Text my="5px"> Vote Type : {sessionVoteType}</Text>
                        <Text my="5px"> Session Voters number : {session.sessionVoters}</Text>
                        <Text my="5px"> Session Proposals number : {session.sessionProposals}</Text>
                        <Alert my="10px" width="auto" status='info' borderRadius="25px"> <AlertIcon />Current workflow status : {sessionWorkflowStatus}</Alert>
                    </>;
                setVoterSessionInfos(sessionsInfos);
            }
            else
            {
                setVoterSessionInfos("");
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [voterSessionSelected,addressToWhitelistLog,workflowStatusLog])

    return (
        <section className="adminSessionInformations">
            <Box my="10px" p="25px" border="1px" borderRadius="25px" borderColor="gray.200">
                <Heading as="h3" size="lg">Voter Session Informations</Heading>
                <Box m="25px" >
                    {voterSessionInfos}
                </Box>
            </Box>
        </section>
    );
}

export default VoterSessionInformations;