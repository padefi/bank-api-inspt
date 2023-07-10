import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import bank from '../img/bank.png';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    fontSize: 12,
    paddingTop: 30,
    paddingLeft: 60,
    paddingRight: 60,
    paddingBottom: 30,
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
    marginTop: 10,
    marginLeft: 10,
  },
  headerText: {
    fontSize: 18,
    marginBottom: 20,
    textDecoration: 'underline',
  },
  headerTitleIcon: {
    width: 40,
    height: 40,
  },
  section: {
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 14,
  },
  datesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  datesLabel: {
    marginRight: 2,
  },
  dateValue: {
    marginRight: 2,
  },
  tableContainer: {
    marginTop: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableCell: {
    flex: 1,
    padding: 8,
  },
  tableHeader: {
    fontSize: 12,
    backgroundColor: '#f0f0f0',
  },
  tableBody: {
    fontSize: 10,
  },
});

// Componente del resumen de cuenta bancaria
const AccountSummaryPDF = ({ dateFrom, dateTo, operations }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTitleContainer}>
            <Image style={styles.headerTitleIcon} src={bank} />
            <Text style={styles.headerTitle}>Banco INSPT-UTN</Text>
          </View>
          <Text style={styles.headerText}>Resumen de Cuenta Bancaria</Text>
        </View>
        <View>
          <View style={styles.section}>
            <Text>Número de Cuenta: {operations.accountId}</Text>
            <Text>Saldo: {operations.accountBalance.toLocaleString("es-AR", { style: "currency", currency: operations.currency.acronym })}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.subTitle}>Movimientos Bancarios:</Text>
            <View style={styles.datesContainer}>
              <Text style={styles.datesLabel}>Desde:</Text>
              <Text style={styles.dateValue}>{new Intl.DateTimeFormat("en-GB", { dateStyle: "short" }).format(new Date(dateFrom)).replace(/,/g, " -")}</Text>
              <Text style={styles.datesLabel}>&nbsp;-&nbsp;Hasta:</Text>
              <Text style={styles.dateValue}>{new Intl.DateTimeFormat("en-GB", { dateStyle: "short" }).format(new Date(dateTo)).replace(/,/g, " -")}</Text>
            </View>
            <View style={styles.tableContainer}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={styles.tableCell}>
                  <Text style={styles.tableHeader}>Fecha</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.tableHeader}>Tipo</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.tableHeader}>Monto</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.tableHeader}>Saldo</Text>
                </View>
              </View>
              {operations.operationDataArray.map((operation, index) => (
                <View style={styles.tableRow} key={index}>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableBody}>{new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "short" }).format(new Date(operation.operationDate)).replace(/,/g, " -")}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableBody}>{operation.type.toUpperCase()}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableBody}>{operation.amount.toLocaleString("es-AR", { style: "currency", currency: operations.currency.acronym })}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableBody}>{operation.balance.toLocaleString("es-AR", { style: "currency", currency: operations.currency.acronym })}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default AccountSummaryPDF;