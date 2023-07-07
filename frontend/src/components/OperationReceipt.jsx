import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import bank from '../img/bank.png';
import check from '../img/check.png';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        padding: 20,
    },
    headerContainer: {
        alignItems: 'center',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 10,
        marginLeft: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'green',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    text: {
        fontSize: 18,
        marginBottom: 10,
    },
    date: {
        fontSize: 16,
        marginTop: 20,
        marginLeft: 20,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitleIcon: {
        width: 40,
        height: 40,
    },
    icon: {
        width: 40,
        height: 40,
    },
    hr: {
        borderBottom: '1 solid black',
        marginBottom: 10,
    },
    section: {
        marginBottom: 20,
        border: '2 solid black',
        padding: 10,
        height: 400,
        flexGrow: 1,
    },
    sectionBody: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    sectionTitle: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
    sectionText: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    value: {
        marginBottom: 10,
    },
});



const OperationReceipt = ({ type, desc, date, origin, destination, amountFromData, amountToData, acronym, tax }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <View style={styles.headerContainer}>
                        <View style={styles.headerTitleContainer}>
                            <Image style={styles.headerTitleIcon} src={bank} />
                            <Text style={styles.headerTitle}>Banco INSPT-UTN</Text>
                        </View>
                        <Text style={styles.headerText}>{type === 'Deposito' ? (<>{type} realizado</>) : (<>{type} realizada</>)} con éxito</Text>
                    </View>
                    <View style={styles.iconContainer}>
                        <Image style={styles.icon} src={check} />
                    </View>
                    <View style={styles.hr} />

                    <Text style={styles.date}>{new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "short" }).format(new Date(date)).replace(/,/g, " -")}</Text>

                    <View style={styles.sectionBody}>
                        <View style={styles.sectionTitle}>
                            {type === 'Transferencia' ? (
                                <>
                                    <Text style={styles.title}>Origen: </Text>
                                    <Text style={styles.title}>Destino: </Text>
                                </>
                            ) : (
                                <Text style={styles.title}>Cuenta: </Text>
                            )}
                            <Text style={styles.title}>Importe: </Text>
                            {tax > 0 && (
                                <>
                                    <Text style={styles.title}>Impuestos: </Text>
                                    <Text style={styles.title}>Importe {desc}: </Text>
                                </>
                            )}
                        </View>

                        <View style={styles.sectionText}>
                            {type === 'Transferencia' ? (
                                <>
                                    <Text style={styles.text}>{origin}</Text>
                                    <Text style={styles.text}>{destination}</Text>
                                </>
                            ) : (
                                <Text style={styles.text}>{origin}</Text>
                            )}
                            <Text style={styles.text}>{amountFromData.toLocaleString("es-AR", { style: "currency", currency: acronym })}</Text>
                            {tax > 0 && (
                                <>
                                    <Text style={styles.text}>{tax.toLocaleString("es-AR", { style: "currency", currency: acronym })} (0.5%)</Text>
                                    <Text style={styles.text}>{amountToData.toLocaleString("es-AR", { style: "currency", currency: acronym })}</Text>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
}

export default OperationReceipt;