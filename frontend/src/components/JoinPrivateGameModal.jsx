import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  VStack,
  Text,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';

const JoinPrivateGameModal = ({ isOpen, onClose, onSubmit }) => {
  const [privateKey, setPrivateKey] = useState('');

  const handleSubmit = () => {
    onSubmit(privateKey);
    setPrivateKey('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Join Private Game</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Text>Enter the private key provided by the game creator:</Text>
            <Input
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="0x..."
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleSubmit}
            isDisabled={!privateKey}
          >
            Join Game
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

JoinPrivateGameModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default JoinPrivateGameModal;
