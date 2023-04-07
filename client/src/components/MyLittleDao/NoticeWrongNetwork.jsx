import { Box, Alert, AlertIcon } from '@chakra-ui/react';

function NoticeWrongNetwork() {
    return (
        <section className="Votes">
            <Box my="10px" p="25px" border='1px' borderRadius='25px' borderColor='gray.200'>
                <Alert width="auto" my="25px" status='warning' borderRadius='25px'> <AlertIcon />MetaMask is not connected to the correct network.</Alert>
            </Box>
        </section>
    );
}

export default NoticeWrongNetwork;
