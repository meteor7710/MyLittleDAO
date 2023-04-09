import { Box, Heading, TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react';
import { useState, useEffect } from "react";
import useEth from "../../contexts/EthContext/useEth";

function AdminVotes({ sessionSelected, voteLog }) {

    const [registeredVotes, setRegisteredVotes] = useState();
    const { state: { contract, accounts, creationBlock } } = useEth();

    //show voter donations history
    useEffect(() => {
        (async function () {
            const votesEvents = await contract.getPastEvents('VoteSubmitted', { filter: { sessionID: sessionSelected }, fromBlock: creationBlock, toBlock: 'latest' });
            const votes = [];

            for (let i = 0; i < votesEvents.length; i++) {
                votes.push(
                    {
                        blockNumber: votesEvents[i].blockNumber,
                        voter: votesEvents[i].returnValues.voter,
                    });
            };

            //Build table body of registered address
            const listVotes = votes.map((vote, index) =>
                <Tr key={"vote" + index}>
                    <Td>{vote.blockNumber}</Td>
                    <Td>{vote.voter}</Td>
                </Tr>
            );

            setRegisteredVotes(listVotes);
        })();
    }, [contract, accounts, sessionSelected, creationBlock, voteLog])

    return (
        <section className="AdminVotes">
            <Box my="10px" p="25px" border='1px' borderRadius='25px' borderColor='gray.200'>
                <Heading as='h3' size='lg'>Votes</Heading>

                <TableContainer my="10px" maxHeight="380px" overflowY="auto">
                    <Table>
                        <TableCaption>Votes</TableCaption>
                        <Thead>
                            <Tr>
                                <Th>Registration Block</Th>
                                <Th>Voters</Th>
                            </Tr>
                        </Thead>
                        <Tbody>{registeredVotes}</Tbody>
                    </Table>
                </TableContainer>
            </Box>
        </section>
    );
}

export default AdminVotes;
