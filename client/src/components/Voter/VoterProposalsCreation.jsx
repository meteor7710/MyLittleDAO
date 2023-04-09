import {
    useDisclosure, FormControl, Flex, Spacer, FormLabel, Textarea, Text, Box, Button, Alert, AlertIcon, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogBody, AlertDialogFooter
} from '@chakra-ui/react';
import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function VoterProposalsCreation({ voterSessionSelected, addProposalLog, setAddProposalLog }) {

    const { state: { contract, accounts } } = useEth();
    const [proposalToAdd, setProposalToAdd] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();

    //Manage Proposal input
    const handleProposalChange = e => {
        setProposalToAdd(e.target.value);
    };

    //Add Proposal
    const addProposal = async () => {
        if (proposalToAdd === "") { setErrorMsg("Proposal description can't be null"); onOpen(); return; }

        const session = await contract.methods.getSession(voterSessionSelected).call({ from: accounts[0] });
        if (session.workflowStatus !== "1") { setErrorMsg("You can't vote at this status"); onOpen(); setProposalToAdd(""); return; }

        if (await contract.methods.registerProposal(proposalToAdd, voterSessionSelected, "0", "0").call({ from: accounts[0] })) {
            const addProposalTx = await contract.methods.registerProposal(proposalToAdd, voterSessionSelected, "0", "0").send({ from: accounts[0] });

            const addedProposalId = addProposalTx.events.ProposalRegistered.returnValues.proposalId;
            setAddProposalLog("Proposal " + addedProposalId + " registered");
            setProposalToAdd("");
        }
    };

    return (
        <section className="VoterProposalsCreation">
            <Box m="25px" >
                <FormControl >
                    <Flex>
                        <Spacer />
                        <FormLabel>Add a proposal :</FormLabel>
                        <Spacer />
                        <Textarea width='400px' type='text' placeholder="Proposal description" onChange={handleProposalChange} value={proposalToAdd} autoComplete="off" />
                        <Spacer />
                        <Button colorScheme='gray' onClick={addProposal}>Add proposal</Button>
                        <Spacer />
                    </Flex>
                </FormControl>
            </Box>
            <Box>
                {(addProposalLog !== "") ? (<Alert width="auto" status='success' borderRadius='25px'> <AlertIcon /> {addProposalLog} </Alert>) :
                    <Text></Text>}
            </Box>
            <AlertDialog isOpen={isOpen} onClose={onClose} >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogBody>
                            <Alert width="auto" status='error' borderRadius='25px'> <AlertIcon />{errorMsg}</Alert>
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

export default VoterProposalsCreation;