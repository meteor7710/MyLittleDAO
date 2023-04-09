import { useState, useEffect } from "react";
import { useEth } from "../../contexts/EthContext";
import {
    Heading, Button, Text, Box, Alert, AlertIcon, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogContent, AlertDialogOverlay, useDisclosure, Table, TableContainer, TableCaption,
    Thead, Tr, Th, Tbody, Td
} from '@chakra-ui/react';

function OwnerSettings({ ownerSessionSelected, settingLog, setSettingLog }) {
    const { state: { contract, accounts, web3, creationBlock } } = useEth();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [errorMsg, setErrorMsg] = useState("");
    const [registeredSettings, setRegisteredSettings] = useState();

    //Withdraw session
    const applySetting = async () => {

        //Validate session is not already withdrawed
        const settingsEvents = await contract.getPastEvents('SettingsApplied', { filter: { sessionID: ownerSessionSelected }, fromBlock: creationBlock, toBlock: 'latest' });
        if (settingsEvents.length > 0) { setErrorMsg("Setting already applied"); onOpen(); return; }

        if (await contract.methods.applyVote(ownerSessionSelected).call({ from: accounts[0] })) {
            const settingTx = await contract.methods.applyVote(ownerSessionSelected).send({ from: accounts[0] });

            let settingDisplay;
            switch (settingTx.events.SettingsApplied.returnValues.setting) {
                case "1":
                    settingDisplay = "maxProposalperSession";
                    break;
                case "2":
                    settingDisplay = "maxVoterperSession";
                    break;
                default:
            }

            setSettingLog("Setting " + settingDisplay + " modified to " + settingTx.events.SettingsApplied.returnValues.value);
        }
    }

    //show withdraw history
    useEffect(() => {
        (async function () {
            const appliedEvents = await contract.getPastEvents('SettingsApplied', { filter: { sessionID: ownerSessionSelected }, fromBlock: creationBlock, toBlock: 'latest' });

            const applied = [];

            for (let i = 0; i < appliedEvents.length; i++) {

                let settingDisplay;
                switch (appliedEvents[i].returnValues.setting) {
                    case "1":
                        settingDisplay = "maxProposalperSession";
                        break;
                    case "2":
                        settingDisplay = "maxVoterperSession";
                        break;
                    default:
                }


                applied.push(
                    {
                        blockNumber: appliedEvents[i].blockNumber,
                        setting: settingDisplay,
                        value: appliedEvents[i].returnValues.value
                    });
            };

            //Build table body of registered address
            const listApplied = applied.map((apply, index) =>
                <Tr key={"apply" + index}>
                    <Td>{apply.blockNumber}</Td>
                    <Td>{apply.setting}</Td>
                    <Td>{apply.value}</Td>
                </Tr>
            );

            setRegisteredSettings(listApplied);
        })();
    }, [contract, accounts, ownerSessionSelected, creationBlock, settingLog, web3])



    return (
        <section className="votes">
            <Box my="10px" p="25px" border='1px' borderRadius='25px' borderColor='gray.200'>
                <Heading as='h3' size='lg'>Setting</Heading>
                <Box m="25px" >
                    <Button colorScheme='gray' onClick={applySetting}>Apply setting</Button>
                </Box>
                <Box>
                    {(settingLog !== "") ? (<Alert width="auto" status='success' borderRadius='25px'> <AlertIcon /> {settingLog} </Alert>) :
                        <Text></Text>}
                </Box>
                <TableContainer my="10px" maxHeight="380px" overflowY="auto">
                    <Table>
                        <TableCaption>Settings Modifications</TableCaption>
                        <Thead>
                            <Tr>
                                <Th>Block Number</Th>
                                <Th>Setting</Th>
                                <Th>New value</Th>
                            </Tr>
                        </Thead>
                        <Tbody>{registeredSettings}</Tbody>
                    </Table>
                </TableContainer>

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

export default OwnerSettings;
