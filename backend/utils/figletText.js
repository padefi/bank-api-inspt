import figlet from "figlet";
import logger from "./logger.js";

const figletText = () => {
  return new Promise((resolve, reject) => {
    figlet.text('Bank API INSPT UTN', { font: 'Standard' }, function (err, data) {
      if (err) {
        logger.error('Error al renderizar el texto Figlet:', err);
        reject(err);
      } else {
        console.log(data);
        resolve();
      }
    });
  });
};

export default figletText;