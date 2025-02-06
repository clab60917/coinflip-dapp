import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Text, VStack, keyframes } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const flipAnimation = keyframes`
  0% { transform: rotateY(0); }
  100% { transform: rotateY(1440deg); }
`;

const CoinAnimation = ({ result, onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <VStack spacing={8} my={8}>
      <Box
        as={motion.div}
        animation={`${flipAnimation} 3s ease-out`}
        w="150px"
        h="150px"
        borderRadius="full"
        bg="gold"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        boxShadow="lg"
        border="4px solid"
        borderColor="yellow.600"
      >
        <Text
          fontSize="4xl"
          fontWeight="bold"
          color="yellow.800"
          opacity={isAnimating ? 0 : 1}
          transition="opacity 0.3s"
        >
          {result ? 'H' : 'T'}
        </Text>
      </Box>
      <Text
        fontSize="2xl"
        fontWeight="bold"
        opacity={isAnimating ? 0 : 1}
        transition="opacity 0.3s"
      >
        {result ? 'HEADS!' : 'TAILS!'}
      </Text>
    </VStack>
  );
};

CoinAnimation.propTypes = {
  result: PropTypes.bool.isRequired,
  onComplete: PropTypes.func,
};

export default CoinAnimation;
