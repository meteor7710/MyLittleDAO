import { useDisclosure, Heading, Box, TableContainer, TableCaption, Thead, Table, Th, Tbody, Tr, Td, Flex, Text, Center, Button, Alert, AlertIcon,AlertDialog,AlertDialogOverlay,AlertDialogContent,AlertDialogBody,AlertDialogFooter } from '@chakra-ui/react';
import useEth from "../../contexts/EthContext/useEth";
import { useState, useEffect } from "react";

function AdminSessionStatus({ sessionSelected,workflowStatusLog,setWorkflowStatusLog }) {

    const { state: { contract, accounts, creationBlock } } = useEth();
    const [workflowEvents, setWorkflowEvents] = useState();
    
    const [errorMsg, setErrorMsg] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();

    //show status event history
    useEffect(() => {
        (async function () {
            const workflowStatusEvents = await contract.getPastEvents('WorkflowStatusChange', {filter: {sessionID: sessionSelected }, fromBlock: creationBlock, toBlock: 'latest' });

            const workflowChanges = [];

            for (let i = 0; i < workflowStatusEvents.length; i++) {
                workflowChanges.push(
                    {
                        blockNumber: workflowStatusEvents[i].blockNumber,
                        previousStatus: workflowStatusEvents[i].returnValues.previousStatus,
                        newStatus: workflowStatusEvents[i].returnValues.newStatus,
                    });
            };

            //Build table body of registered address
            const listWorkflowChanges = workflowChanges.map((status, index) =>
                <Tr key={"status" + index}>
                    <Td>{status.blockNumber}</Td>
                    <Td>{status.previousStatus}</Td>
                    <Td>{status.newStatus}</Td>
                </Tr>
            );

            setWorkflowEvents(listWorkflowChanges);
        })();
    }, [contract,sessionSelected, creationBlock, workflowStatusLog])

    //Change workflowstatus to next status
    const changeStatus = async () => {

        const session = await contract.methods.getSession((sessionSelected)).call({ from: accounts[0] });

        if( session.workflowStatus === "0" && session.sessionVoters === "0") { setErrorMsg("You must have one voter before changing status"); onOpen(); return; }
        if( session.workflowStatus === "1" && session.sessionProposals === "0") { setErrorMsg("You must have one proposal before changing status"); onOpen(); return; }

        if (await contract.methods.changeWorkflowStatus(sessionSelected).call({ from: accounts[0] })) {
            const workflowStatusTx = await contract.methods.changeWorkflowStatus(sessionSelected).send({ from: accounts[0] })

            const workflowPreviousStatus = workflowStatusTx.events.WorkflowStatusChange.returnValues.previousStatus;
            const workflowNewStatus = workflowStatusTx.events.WorkflowStatusChange.returnValues.newStatus;

            setWorkflowStatusLog("Change status from " + workflowPreviousStatus + " to " + workflowNewStatus);
        }
    };

    return (
        <section className="adminSessionStatus">
            <Box my="10px" p="25px" border="1px" borderRadius="25px" borderColor="gray.200">
                <Heading as="h3" size="lg">Session Status</Heading>
                <Box m="25px">
                    <Flex>
                        <Text my="25px">Change workflow status actions :</Text>
                        <Center mx="25px">
                            {
                                <Button colorScheme='gray' onClick={changeStatus}>Change to next status</Button>

                            }
                        </Center>
                    </Flex>
                </Box>
                <Box>
                    {(workflowStatusLog !== "") ? (<Alert width="auto" status='success' borderRadius='25px'> <AlertIcon /> {workflowStatusLog} </Alert>) :
                        <Text></Text>}
                </Box>
                <TableContainer>
                    <Table>
                        <TableCaption>Workflows status history</TableCaption>
                        <Thead>
                            <Tr>
                                <Th>Registration Block Number</Th>
                                <Th>Previous Status</Th>
                                <Th>Next Status</Th>
                            </Tr>
                        </Thead>
                        <Tbody>{workflowEvents}</Tbody>
                    </Table>
                </TableContainer>
            </Box>
            <AlertDialog isOpen={isOpen} onClose={onClose} >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogBody>
                            <Alert width="auto" status="error" borderRadius="25px"> <AlertIcon />{errorMsg}</Alert>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={onClose}>Close</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </section>

    );
}

export default AdminSessionStatus;