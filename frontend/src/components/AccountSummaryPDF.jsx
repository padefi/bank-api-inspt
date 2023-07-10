import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import bank from '../img/bank.png';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    fontSize: 12,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerDateContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 10,
    marginLeft: 2,
  },
  headerText: {
    fontSize: 18,
  },
  headerDate: {
    fontSize: 10,
  },
  headerTitleIcon: {
    width: 10,
    height: 10,
  },
  hr: {
    borderBottom: '1 solid black',
    marginBottom: 10,
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
  noResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 30,
    right: 60,
    left: 'auto',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    textAlign: 'center',
  },
});

// Componente del resumen de cuenta bancaria
const AccountSummaryPDF = ({ holder, dateFrom, dateTo, operations }) => {
  const pageSize = 20;
  const totalOperations = operations.operationDataArray.length;
  const totalPages = Math.ceil(totalOperations / pageSize);

  return (
    <Document>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
        <Page size="A4" style={styles.page} key={pageNumber}>
          <View style={styles.headerContainer}>
            <View style={styles.headerTitleContainer}>
              <Image style={styles.headerTitleIcon} src={bank} />
              <Text style={styles.headerTitle}>Banco INSPT-UTN</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>Resumen de cuenta</Text>
            </View>
            <View style={styles.headerDateContainer}>
              <Text style={styles.headerDate}>Fecha: {new Date().toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={styles.hr} />
          <View>
            <View style={styles.section}>
              <Text>Titular: {holder.toUpperCase()}</Text>
              <Text>Cuenta: {operations.accountId.substring(3, 7)} - {operations.accountId.substring(11, 21)}</Text>
              <Text>Saldo: {operations.accountBalance.toLocaleString("es-AR", { style: "currency", currency: operations.currency.acronym })}</Text>
            </View>
            <View style={styles.section}>
              <View style={styles.datesContainer}>
                <Text style={styles.datesLabel}>Desde:</Text>
                <Text style={styles.dateValue}>{new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeZone: 'UTC' }).format(new Date(dateFrom)).replace(/,/g, " -")}</Text>
                <Text style={styles.datesLabel}>&nbsp;-&nbsp;Hasta:</Text>
                <Text style={styles.dateValue}>{new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeZone: 'UTC' }).format(new Date(dateTo)).replace(/,/g, " -")}</Text>
              </View>
              <View style={styles.hr} />
              <View style={styles.tableContainer}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableHeader} fixed>Fecha</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableHeader} fixed>Tipo</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableHeader} fixed>Monto</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableHeader} fixed>Saldo</Text>
                  </View>
                </View>
                {operations.operationDataArray.length > 0 ? (
                  operations.operationDataArray.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map((operation, index) => (
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
                  ))
                ) : (
                  <View style={styles.noResult}>
                    <Text style={styles.subTitle}>Sin operaciones en el rango indicado</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.footerContainer}>
            <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
              `Página: ${pageNumber} de ${totalPages}`
            )} fixed />
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default AccountSummaryPDF;