import { motion } from 'framer-motion';
import { GiFireworkRocket } from 'react-icons/gi';  // Replace FaFireworks with GiFireworkRocket

const fireworkVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: [0.5, 1.2, 1], opacity: [0, 1, 0.8], rotate: [0, 360, 720] },
  exit: { scale: 0, opacity: 0 },
};

const SuccessIcon = () => {
  return (
    <motion.div
      variants={fireworkVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 1, ease: 'easeInOut', loop: Infinity }}
      className="text-green-600"
    >
      <GiFireworkRocket size={48} /> 
    </motion.div>
  );
};

export default SuccessIcon;
