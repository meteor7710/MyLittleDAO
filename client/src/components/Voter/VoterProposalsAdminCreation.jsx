import {
    useDisclosure, FormControl, Flex, Spacer, FormLabel, Textarea, Text, Box, Button, Alert, AlertIcon, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogBody, AlertDialogFooter, Input, Select
} from '@chakra-ui/react';
import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function VoterProposalsAdminCreation({ voterSessionSelected, addProposalLog, setAddProposalLog }) {

    const { state: { contract, accounts } } = useEth();
    const [proposalToAdd, setProposalToAdd] = useState("");
    const [proposalSetting, setProposalSetting] = useState("0");
    const [proposalSettingValue, setProposalSettingValue] = useState("0");
    const [errorMsg, setErrorMsg] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();

    //Manage Proposal input
    const handleProposalChange = e => {
        setProposalToAdd(e.target.value);
    };

    //Manage Proposal input
    const handleSettingChange = e => {
        setProposalSetting(e.target.value);
    };

    //Manage Proposal input
    const handleSettingValueChange = e => {
        setProposalSettingValue(e.target.value);
    };

    //Add Proposal
    const addProposal = async () => {
        if (proposalToAdd === "") { setErrorMsg("Proposal description can't be null"); onOpen(); return; }
        if (!(proposalSetting === "1" || proposalSetting === "2")) { setErrorMsg("Setting must selected "); onOpen(); return; }
        if (proposalSettingValue === "" || proposalSettingValue === "0") { setErrorMsg("Setting value can't be null or 0"); onOpen(); return; }

        const session = await contract.methods.getSession(voterSessionSelected).call({ from: accounts[0] });
        if (session.workflowStatus !== "1") { setErrorMsg("You can't vote at this status"); onOpen(); setProposalToAdd(""); return; }

        if (await contract.methods.registerProposal(proposalToAdd, voterSessionSelected, proposalSetting, proposalSettingValue).call({ from: accounts[0] })) {
            const addProposalTx = await contract.methods.registerProposal(proposalToAdd, voterSessionSelected, proposalSetting, proposalSettingValue).send({ from: accounts[0] });

            const addedProposalId = addProposalTx.events.ProposalRegistered.returnValues.proposalId;
            setAddProposalLog("Proposal " + addedProposalId + " registered");
            setProposalToAdd("");
        }
    };

    return (
        <section className="VoterProposalsAdminCreation">
            <Box m="25px" >
                <FormControl >
                    <FormLabel>Add admin proposal :</FormLabel>
                    <Textarea my="10px" width='400px' type='text' placeholder="Proposal description" onChange={handleProposalChange} value={proposalToAdd} autoComplete="off" />
                    <Flex>
                        <Select width="40%" my="10px" placeholder="Setting to change" onChange={handleSettingChange} value={proposalSetting}>
                            <option value="1" >maxProposalperSession</option>
                            <option value="2" >maxVoterperSession</option>
                        </Select>
                        <Spacer />
                        <Input my="10px" width='400px' type='number' placeholder="New setting value" onChange={handleSettingValueChange} value={proposalSettingValue} autoComplete="off" />
                    </Flex>
                    <Button my="10px" colorScheme='gray' onClick={addProposal}>Add proposal</Button>
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

export default VoterProposalsAdminCreation;