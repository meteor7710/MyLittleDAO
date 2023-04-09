import { Heading, Text, Box, TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react';
import { useState, useEffect } from "react";
import useEth from "../../contexts/EthContext/useEth";
import VoterProposalsCreation from './VoterProposalsCreation';
import VoterProposalsAdminCreation from './VoterProposalsAdminCreation';

function VoterProposals({ voterSessionSelected, addProposalLog, setAddProposalLog, voterSessionStatus, voterSessionType }) {

    const { state: { contract, accounts, creationBlock } } = useEth();
    const [proposalsInformations, setProposalsInformations] = useState([]);

    //show proposal already registered
    useEffect(() => {
        (async function () {

            //Get proposal information from a proposal ID
            async function getProposalInformations(proposalId) {
                let proposal = [];
                proposal = await contract.methods.getProposal(parseInt(proposalId), voterSessionSelected).call({ from: accounts[0] });
                return proposal;
            };

            const proposalRegisteredEvents = await contract.getPastEvents('ProposalRegistered', { filter: { sessionID: voterSessionSelected }, fromBlock: creationBlock, toBlock: 'latest' });
            const proposalsList = [];

            for (let i = 0; i < proposalRegisteredEvents.length; i++) {
                let proposal = [];
                proposal = await getProposalInformations(i + 1);

                proposalsList.push(
                    {
                        id: proposalRegisteredEvents[i].returnValues.proposalId,
                        description: proposal.description,
                    });
            };

            const listProposal = proposalsList.map((prop, index) =>
                <Tr key={"proposal" + index}>
                    <Td>{prop.id}</Td>
                    <Td>{prop.description}</Td>
                </Tr>
            );
            setProposalsInformations(listProposal);
        })();
    }, [contract, accounts, creationBlock, addProposalLog, voterSessionSelected])

    return (
        <section className="VoterProposals">
            <Box my="10px" p="25px" border='1px' borderRadius='25px' borderColor='gray.200'>
                <Heading as='h3' size='lg'>Proposals</Heading>
                {((voterSessionType === "2") && (voterSessionStatus ==="1") ) ? (<VoterProposalsAdminCreation voterSessionSelected={voterSessionSelected} addProposalLog={addProposalLog} setAddProposalLog={setAddProposalLog} />) :
                    (voterSessionStatus ==="1") ? (<VoterProposalsCreation voterSessionSelected={voterSessionSelected} addProposalLog={addProposalLog} setAddProposalLog={setAddProposalLog} /> ):
                    <Text></Text>
                    }
                <TableContainer maxHeight="380px" overflowY="auto">
                    <Table>
                        <TableCaption>Proposals list</TableCaption>
                        <Thead>
                            <Tr>
                                <Th>Proposal ID</Th>
                                <Th>Proposal Description</Th>
                            </Tr>
                        </Thead>
                        <Tbody>{proposalsInformations}</Tbody>
                    </Table>
                </TableContainer>
            </Box>
        </section>
    );
}

export default VoterProposals;