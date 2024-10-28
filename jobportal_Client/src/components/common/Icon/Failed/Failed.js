import { motion } from 'framer-motion';
import { FaTimesCircle } from 'react-icons/fa';

const failureVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
  shake: { x: [0, -10, 10, -10, 10, 0] },
};

const FailureIcon = () => {
  return (
    <motion.div
      variants={failureVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
      whileHover="shake"
      className="text-red-600"
    >
      <FaTimesCircle size={48} />
    </motion.div>
  );
};

export default FailureIcon;
