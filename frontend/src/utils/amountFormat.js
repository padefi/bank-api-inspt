const amountFormat = (input) => {
    const sanitizedValue = input.replace(/[^0-9.]/g, '');
    const decimalCount = (sanitizedValue.match(/\./g) || []).length;

    if (decimalCount > 1) {
        const [integerPart, decimalPart] = sanitizedValue.split('.');
        const formattedValue = `${integerPart}.${decimalPart.slice(0, 2)}`;
        return formattedValue;
    } else if (decimalCount === 1 && sanitizedValue.split('.')[1].length > 2) {
        const [integerPart, decimalPart] = sanitizedValue.split('.');
        const formattedValue = `${integerPart}.${decimalPart.slice(0, 2)}`;
        return formattedValue;
    } else {
        return sanitizedValue
    }
};

export default amountFormat;