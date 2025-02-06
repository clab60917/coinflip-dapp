import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Code,
  VStack,
  useClipboard,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

const PrivateGameModal = ({ isOpen, onClose, gameKey }) => {
  const { hasCopied, onCopy } = useClipboard(gameKey);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Private Game Created</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="start">
            <Text>Share this key with your opponent to join the game:</Text>
            <Code p={2} borderRadius="md" width="100%" fontSize="sm">
              {gameKey}
            </Code>
            <Button size="sm" onClick={onCopy}>
              {hasCopied ? 'Copied!' : 'Copy Key'}
            </Button>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

PrivateGameModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  gameKey: PropTypes.string.isRequired,
};

export default PrivateGameModal;
