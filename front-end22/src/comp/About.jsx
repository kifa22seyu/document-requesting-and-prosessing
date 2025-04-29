import { motion } from "framer-motion";
import Navbar from "./navbar";
import Footer from "./footer";

const AboutUs = () => {
  // Team members data
  const teamMembers = [
    { name: "John Doe", role: "CEO", image: "https://via.placeholder.com/150" },
    { name: "Jane Smith", role: "Designer", image: "https://via.placeholder.com/150" },
    { name: "Mike Johnson", role: "Developer", image: "https://via.placeholder.com/150" },
  ];

  // Animated text variants
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <Navbar />
      <motion.div
        className="hero from-blue-100 via-blue-300 to-blue-500 bg-gradient-to-br py-10 text-white text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="text-5xl font-bold mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1, type: "spring", stiffness: 100 }}
        >
          About Us
        </motion.h1>

        <motion.p
          className="text-xl mb-6 max-w-3xl mx-auto"
          variants={textVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        >
          We are a passionate team dedicated to creating innovative solutions that make a difference. Our mission is to empower businesses and individuals through cutting-edge technology and creative design.
        </motion.p>

        <motion.p
          className="text-xl mb-12 max-w-3xl mx-auto"
          variants={textVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.2 }}
        >
          Founded in 2020, we have grown into a trusted partner for clients worldwide. Our values of integrity, creativity, and excellence drive everything we do.
        </motion.p>

        {/* Team Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
          }}
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className="bg-white/20 backdrop-blur-sm rounded-lg p-6 shadow-lg"
              variants={textVariants}
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-2xl font-semibold">{member.name}</h3>
              <p className="text-gray-200">{member.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      <Footer />
    </>
  );
};

export default AboutUs;