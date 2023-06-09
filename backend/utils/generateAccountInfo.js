const generateAccountId = (accountType) => {

    const bankCode = '999', sucursalCod = '0001', typeCode = (accountType == 'CA') ? '01' : '02', accountNumber = randomNumers(11);
    const { dv1, dv2 } = generateDV((bankCode + sucursalCod), (typeCode, accountNumber));
    const cbu = `${bankCode}${sucursalCod}${dv1}${typeCode}${accountNumber}${dv2}`;

    return cbu;
}

const generateAlias = (firstName, lastName, accountType, currency) => {

    const nameFormatted = firstName.replace(/\s/g, '.');
    const lastNameFormatted = lastName.replace(/\s/g, '.');
    let alias = nameFormatted + '.' + lastNameFormatted;

    if (alias.length > 13) {
        alias = alias.slice(0, 13);
    }

    alias += '.' + accountType;
    alias += '.' + currency;

    return alias.toUpperCase();
}

const generateDV = (num1, num2) => {

    let sum = 0, validatorNumbers = [7, 1, 3, 9, 7, 1, 3];
    [...num1].forEach(function callback(val, i) {
        sum += parseInt(val * validatorNumbers[i]);
    });

    const dv1 = (10 - (sum % 10)) % 10;

    validatorNumbers.unshift(3, 9);
    validatorNumbers.push(9, 7, 1, 3);

    sum = 0;
    [...num2].forEach(function callback(val, i) {
        sum += parseInt(val * validatorNumbers[i]);
    });

    const dv2 = (10 - (sum % 10)) % 10;

    return { dv1, dv2 };
}

const randomNumers = (n) => {
    let number = '';

    for (let i = 0; i < n; i++) {
        number += Math.floor(Math.random() * 10);
    }

    return number;
}

export {
    generateAccountId,
    generateAlias
}