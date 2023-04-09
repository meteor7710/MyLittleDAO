import { Box, Heading, FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useEffect, useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function WithdrawerSessions({withdrawerSessionSelected, setWithdrawerSessionSelected,workflowStatusLog}) {

    const { state: { contract, accounts, creationBlock,networkID } } = useEth();
    const [withdrawerSessionList, setWithdrawerSessionList] = useState([]);

    //Manage Session selected
    const handleWithdrawerSelectedSession = e => {
        setWithdrawerSessionSelected(e.target.value);
    };

    //show session create where user is withdrawer
    useEffect(() => {
        (async function () {

            //Get Session information from a Session ID
            async function getSessionlInformations(sessionID) {
                let session = [];
                session = await contract.methods.getSession(parseInt(sessionID)).call({ from: accounts[0] });
                return session;
            };

            //Create Session admin list from events
            const talliedEvents = await contract.getPastEvents("WorkflowStatusChange", {filter: {newStatus: 5 }, fromBlock: creationBlock, toBlock: "latest" });

            let withdrawSessions = [];

            for (let i = 0; i < talliedEvents.length; i++) {

                //validate session type is Pote Vote
                let session = await getSessionlInformations(talliedEvents[i].returnValues.sessionID);
               
                if (session.voteType === "1")
                {
                     //validate user is withdrawer
                    const withdrawer = await contract.methods.getSessionWithdrawer(parseInt(talliedEvents[i].returnValues.sessionID)).call({ from: accounts[0] });
                    if ( withdrawer === accounts[0]){

                        withdrawSessions.push(
                            {
                                id: talliedEvents[i].returnValues.sessionID,
                                title: session.title,
                            });
                    }
                }
            }

            //Manage witdrawer list selection
            const withdrawerSessionsRendered = withdrawSessions.map((session, index) =>
                <option key={"session" + index} value={session.id}>Session {session.id} - {session.title}</option>
            );

            setWithdrawerSessionList(withdrawerSessionsRendered);
        })();
    }, [contract, accounts, networkID, creationBlock,workflowStatusLog])


    return (
        <section className="WithdrawerSessions">
            <Box my="10px" p="25px" border="1px" borderRadius="25px" borderColor="gray.200">
                <Heading as="h3" size="lg">Withdrawer role Session List</Heading>
                <Box m="25px" >
                    <FormControl >
                        <FormLabel my="5px">Select Session</FormLabel>
                        <Select my="5px" placeholder="Withdrawer Sessions" onChange={handleWithdrawerSelectedSession} value={withdrawerSessionSelected}>
                            {withdrawerSessionList}
                        </Select>
                    </FormControl>
                </Box>
            </Box>
        </section>
    );
}

export default WithdrawerSessions;