import { Box, Heading, FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useEffect, useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function OwnerSessions({ownerSessionSelected, setOwnerSessionSelected,workflowStatusLog}) {

    const { state: { contract, accounts, creationBlock,networkID,owner } } = useEth();
    const [ownerSessionList, setOwnerSessionList] = useState([]);

    //Manage Session selected
    const handleOwnerSelectedSession = e => {
        setOwnerSessionSelected(e.target.value);
    };

    //show session create where user is owner
    useEffect(() => {
        (async function () {

            //Get Session information from a Session ID
            async function getSessionlInformations(sessionID) {
                let session = [];
                session = await contract.methods.getSession(parseInt(sessionID)).call({ from: accounts[0] });
                return session;
            };

            //Create Session flist from events
            const talliedEvents = await contract.getPastEvents("WorkflowStatusChange", {filter: {newStatus: 5 }, fromBlock: creationBlock, toBlock: "latest" });

            let ownerSessions = [];

            for (let i = 0; i < talliedEvents.length; i++) {

                //validate session type is Pote Vote
                let session = await getSessionlInformations(talliedEvents[i].returnValues.sessionID);
               
                if (session.voteType === "2")
                {
                    if ( owner === accounts[0]){

                        ownerSessions.push(
                            {
                                id: talliedEvents[i].returnValues.sessionID,
                                title: session.title,
                            });
                    }
                }
            }

            //Manage owner list selection
            const ownerSessionsRendered = ownerSessions.map((session, index) =>
                <option key={"session" + index} value={session.id}>Session {session.id} - {session.title}</option>
            );

            setOwnerSessionList(ownerSessionsRendered);
        })();
    }, [contract, accounts, networkID, creationBlock,workflowStatusLog,owner])


    return (
        <section className="OwnerSessions">
            <Box my="10px" p="25px" border="1px" borderRadius="25px" borderColor="gray.200">
                <Heading as="h3" size="lg">Owner role Session List</Heading>
                <Box m="25px" >
                    <FormControl >
                        <FormLabel my="5px">Select Session</FormLabel>
                        <Select my="5px" placeholder="Owner Sessions" onChange={handleOwnerSelectedSession} value={ownerSessionSelected}>
                            {ownerSessionList}
                        </Select>
                    </FormControl>
                </Box>
            </Box>
        </section>
    );
}

export default OwnerSessions;