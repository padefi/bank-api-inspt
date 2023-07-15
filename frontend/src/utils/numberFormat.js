const numberFormat = (input) => {
    const sanitizedValue = input.replace(/[^0-9.]/g, '');
    
    return sanitizedValue
};

export default numberFormat;