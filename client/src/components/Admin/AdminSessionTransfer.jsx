import { useDisclosure, Box, Heading, FormControl, Flex, Spacer, Input, Button, Center, FormLabel, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogBody, Alert, AlertIcon, AlertDialogFooter } from '@chakra-ui/react';
import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function AdminSessionTransfer({ sessionSelected, setNewAdminAddressLog, setSessionSelected }) {

    const [newAdminAddress, setNewAdminAddress] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { state: { contract, accounts, web3 } } = useEth();

    //Manage address input
    const handleAdressChange = e => {
        setNewAdminAddress(e.target.value);
    };

    //Transfer Adminship
    const transferAdminship = async () => {
        if (!web3.utils.isAddress(newAdminAddress)) { setErrorMsg("Address invalid"); onOpen(); setNewAdminAddress(""); return; }

        if (await contract.methods.transferSessionAdmin(newAdminAddress, sessionSelected).call({ from: accounts[0] })) {
            const transferTx = await contract.methods.transferSessionAdmin(newAdminAddress, sessionSelected).send({ from: accounts[0] });
            const newAdmin = transferTx.events.sessionAdminTransferred.returnValues.newAdmin;
            setNewAdminAddressLog("Session adminship transfered to " + newAdmin);
            setNewAdminAddress("");
            setSessionSelected("");
        }
    };

    return (
        <section className="adminSessionTransfert">
            <Box my="10px" p="25px" border='1px' borderRadius='25px' borderColor='gray.200'>
                <Heading as="h3" size="lg">Session Transfer</Heading>
                <Box m="25px" >
                    <FormControl >
                        <Flex>
                            <Spacer />
                            <Center>
                                <FormLabel>Transfer adminship :</FormLabel>
                            </Center>
                            <Spacer />
                            <Input width='400px' type='text' placeholder="New admin address" onChange={handleAdressChange} value={newAdminAddress} autoComplete="off" />
                            <Spacer />
                            <Button colorScheme='gray' onClick={transferAdminship}>Transfer</Button>
                            <Spacer />
                        </Flex>
                    </FormControl>
                </Box>
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

export default AdminSessionTransfer;
