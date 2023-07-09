import React from 'react';
import { PDFViewer, Document, Page, Text, View, StyleSheet, Table, TableCell, TableHeader, TableBody, DataTableCell } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    paddingTop: 30,
    paddingLeft: 60,
    paddingRight: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 10,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  tableCell: {
    padding: 8,
  },
});

// Componente del resumen de cuenta bancaria
const AccountSummaryPDF = ({ account, transactions }) => (
  <PDFViewer>
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.title}>Resumen de Cuenta Bancaria</Text>
          <View style={styles.section}>
            <Text>Número de Cuenta: {account.accountNumber}</Text>
            <Text>Saldo: {account.balance}</Text>
            <Text>Titular: {account.holder}</Text>
          </View>
          <View style={styles.table}>
            <Table>
              <TableHeader>
                <TableCell style={styles.tableHeader}>Fecha</TableCell>
                <TableCell style={styles.tableHeader}>Descripción</TableCell>
                <TableCell style={styles.tableHeader}>Monto</TableCell>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, index) => (
                  <TableRow key={index} style={styles.tableRow}>
                    <DataTableCell style={styles.tableCell}>{transaction.date}</DataTableCell>
                    <DataTableCell style={styles.tableCell}>{transaction.description}</DataTableCell>
                    <DataTableCell style={styles.tableCell}>{transaction.amount}</DataTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </View>
        </View>
      </Page>
    </Document>
  </PDFViewer>
);

export default AccountSummaryPDF;