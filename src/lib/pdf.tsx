import { Document, Image, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import type { Sale, SareeItem } from '@/types';
import logoUrl from '@/assets/LakshmiDeviLogo.png';

const MAROON = '#701527';
const GOLD = '#C19736';
const CREAM = '#FAF6EB';
const BORDER = '#DCCCAE';
const TEXT = '#4A4037';
const MUTED = '#7D7165';

// Set to false if you don't want the Terms & Care box on the receipt
const SHOW_TERMS = true;

const SHOP = {
  name: 'Amma Meenakshi Saree Mandir',
  nameLine1: 'Amma Meenakshi',
  nameLine2: 'Saree Mandir',
  tagline: 'Traditional Sarees  |  Pure Elegance  |  Timeless Beauty',
  since: 'Since 1995',
  categories: 'Kanchipuram Silk  •  Dharmavaram Silk  •  Pattu & Fancy  •  Wholesale & Retail',
  address: 'Mythri Amogha Apartment, Electronic City Phase 1, Bangalore',
  phoneLabel: 'Sadhu',
  phone: '6300080805',
  motto: 'Grace in Every Thread...',
};

const TERMS = [
  'Exchange within 7 days with bill & tags intact.',
  'No returns on blouse-cut or altered sarees.',
  'Zari & silk: dry clean only; store in muslin.',
  'Handloom colour variations are natural.',
];

const styles = StyleSheet.create({
  page: { padding: 0, paddingBottom: 56, fontFamily: 'Helvetica', fontSize: 8, color: TEXT, backgroundColor: '#FFFFFF' },

  // Header: left | logo | right
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: MAROON, paddingHorizontal: 40, paddingVertical: 16, minHeight: 116 },
  headerLeft: { flex: 1, alignItems: 'flex-start', justifyContent: 'center' },
  headerCenter: { width: 92, alignItems: 'center', justifyContent: 'center' },
  headerRight: { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },

  logoFrame: { width: 64, height: 92, borderWidth: 1.5, borderColor: GOLD, borderRadius: 6, overflow: 'hidden', backgroundColor: '#F6EBC8' },
  logo: { width: 64, height: 92, objectFit: 'cover' },

  shopName: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Helvetica-Bold', lineHeight: 1.25 },
  sinceBadge: { color: GOLD, fontSize: 8, fontFamily: 'Helvetica-Bold', marginTop: 8, borderWidth: 0.8, borderColor: GOLD, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },

  invoiceTitle: { color: '#FFFFFF', fontSize: 20, fontFamily: 'Helvetica-Bold', letterSpacing: 1.5 },
  invoiceMeta: { color: '#F7EBD0', fontSize: 8.5, marginTop: 5, textAlign: 'right' },
  invoiceNo: { color: GOLD, fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 7, textAlign: 'right' },

  goldLine: { height: 5, backgroundColor: GOLD },

  // Info strip under the header (centered)
  infoStrip: { backgroundColor: CREAM, borderBottomWidth: 0.8, borderBottomColor: BORDER, paddingVertical: 9, paddingHorizontal: 40, alignItems: 'center' },
  stripTagline: { color: MAROON, fontSize: 8.5, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  stripCategories: { color: '#8A6A1E', fontSize: 7.3, marginTop: 3, textAlign: 'center' },
  stripContact: { color: TEXT, fontSize: 8, marginTop: 4, textAlign: 'center' },
  stripStrong: { fontFamily: 'Helvetica-Bold', color: MAROON },

  section: { marginHorizontal: 40 },
  infoRow: { flexDirection: 'row', gap: 9, marginTop: 16 },
  infoBox: { flex: 1, minHeight: 56, backgroundColor: CREAM, borderColor: BORDER, borderWidth: 0.8, borderRadius: 5, padding: 9 },
  boxLabel: { color: MAROON, fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', marginBottom: 6 },
  boxStrong: { color: TEXT, fontSize: 8.5, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  boxText: { color: MUTED, fontSize: 7.5, marginBottom: 3 },

  table: { marginTop: 14, borderWidth: 0.8, borderColor: BORDER },
  tableHeader: { flexDirection: 'row', backgroundColor: MAROON, minHeight: 23, alignItems: 'center' },
  tableRow: { flexDirection: 'row', minHeight: 28, alignItems: 'center', borderTopWidth: 0.5, borderTopColor: BORDER },
  tableRowAlt: { backgroundColor: '#FCF8EF' },
  cell: { paddingHorizontal: 5, fontSize: 7.5 },
  headerCell: { paddingHorizontal: 5, fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  c1: { width: '7%', textAlign: 'center' },
  c2: { width: '33%' },
  c3: { width: '14%', textAlign: 'center' },
  c4: { width: '9%', textAlign: 'center' },
  c5: { width: '18%', textAlign: 'right' },
  c6: { width: '19%', textAlign: 'right' },

  // Words (left) + totals (right)
  summary: { flexDirection: 'row', marginTop: 14, alignItems: 'flex-start' },
  wordsPanel: { flex: 1, paddingRight: 24, paddingTop: 4 },
  wordsLabel: { color: MAROON, fontFamily: 'Helvetica-Bold', fontSize: 7, textTransform: 'uppercase', marginBottom: 5 },
  wordsText: { color: TEXT, fontSize: 8, lineHeight: 1.4 },
  totalsPanel: { width: '48%' },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0.5, borderBottomColor: BORDER, paddingVertical: 5, color: MUTED, fontSize: 7.8 },
  totalValue: { color: TEXT, fontFamily: 'Helvetica-Bold' },
  grandTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: MAROON, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 8, marginTop: 6 },
  grandLabel: { color: GOLD, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  grandValue: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Helvetica-Bold' },

  lowerRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  lowerBox: { flex: 1, backgroundColor: CREAM, borderColor: BORDER, borderWidth: 0.8, borderRadius: 5, padding: 10 },
  detailRow: { flexDirection: 'row', marginBottom: 5 },
  detailKey: { width: 66, color: MUTED, fontSize: 7.2 },
  detailValue: { flex: 1, color: TEXT, fontSize: 7.2, fontFamily: 'Helvetica-Bold' },
  term: { color: MUTED, fontSize: 7, marginBottom: 4 },

  spacer: { flexGrow: 1 },
  signature: { alignItems: 'flex-end', marginTop: 16, marginRight: 40, marginBottom: 8 },
  signatureName: { color: MAROON, fontFamily: 'Helvetica-Bold', fontSize: 7.5 },
  signatureLine: { width: 145, borderBottomWidth: 0.8, borderBottomColor: TEXT, marginTop: 22, marginBottom: 4 },
  signatureSub: { color: MUTED, fontSize: 6.8 },

  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 42, backgroundColor: MAROON, alignItems: 'center', justifyContent: 'center' },
  footerText: { color: '#FFFFFF', fontSize: 8 },
  footerSub: { color: GOLD, fontSize: 7, marginTop: 4 },
});

function money(value: number): string {
  return `Rs. ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function plainMoney(value: number): string {
  return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function amountInWords(value: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const words = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ''}`;
    if (n < 1000) return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${words(n % 100)}` : ''}`;
    if (n < 100000) return `${words(Math.floor(n / 1000))} Thousand${n % 1000 ? ` ${words(n % 1000)}` : ''}`;
    if (n < 10000000) return `${words(Math.floor(n / 100000))} Lakh${n % 100000 ? ` ${words(n % 100000)}` : ''}`;
    return `${words(Math.floor(n / 10000000))} Crore${n % 10000000 ? ` ${words(n % 10000000)}` : ''}`;
  };
  const rupees = Math.floor(value);
  const paise = Math.round((value - rupees) * 100);
  return `${rupees ? words(rupees) : 'Zero'} Rupees${paise ? ` and ${words(paise)} Paise` : ''} Only`;
}

// Load the logo as a base64 data URL so the PDF library can always read it.
let logoPromise: Promise<string | null> | null = null;
function loadLogo(): Promise<string | null> {
  if (!logoPromise) {
    logoPromise = (async () => {
      try {
        const res = await fetch(logoUrl);
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    })();
  }
  return logoPromise;
}

type TableCellStyle = typeof styles.c1 | typeof styles.c2 | typeof styles.c3 | typeof styles.c4 | typeof styles.c5 | typeof styles.c6;

function TableCell({ children, style }: { children: string; style: TableCellStyle }): ReactElement {
  return <Text style={[styles.cell, style]}>{children}</Text>;
}

function InvoiceRow({ item, index }: { item: SareeItem; index: number }): ReactElement {
  const line = Number(item.line_total) || Number(item.price) * Number(item.quantity) || 0;
  return (
    <View style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
      <TableCell style={styles.c1}>{String(index + 1)}</TableCell>
      <TableCell style={styles.c2}>{item.saree_name}</TableCell>
      <TableCell style={styles.c3}>{item.saree_code || '-'}</TableCell>
      <TableCell style={styles.c4}>{String(item.quantity)}</TableCell>
      <TableCell style={styles.c5}>{plainMoney(Number(item.price) || 0)}</TableCell>
      <TableCell style={styles.c6}>{plainMoney(line)}</TableCell>
    </View>
  );
}

export function InvoiceDocument({ sale, logo }: { sale: Sale; logo?: string | null }): ReactElement {
  const items = sale.sale_items ?? [];
  const discount = Number(sale.discount) || 0;
  const subtotal = Number(sale.subtotal) || 0;
  const total = Number(sale.total) || 0;

  const paid = sale.payment_status === 'Paid' ? total : Math.min(total, Number(sale.amount_paid) || 0);
  const balance = Math.max(0, total - paid);

  const paymentRows: [string, string][] = [
    ['Mode', sale.payment_method],
    ['Status', sale.payment_status],
    ['Amount Paid', money(paid)],
  ];
  if (balance > 0) paymentRows.push(['Balance Due', money(balance)]);

  return (
    <Document title={sale.invoice_number} author={SHOP.name}>
      <Page size="A4" style={styles.page} wrap>
        {/* Header: shop name | logo | invoice info */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.shopName}>{SHOP.nameLine1}</Text>
            <Text style={styles.shopName}>{SHOP.nameLine2}</Text>
            <Text style={styles.sinceBadge}>{SHOP.since}</Text>
          </View>

          <View style={styles.headerCenter}>
            {logo ? (
              <View style={styles.logoFrame}>
                <Image src={logo} style={styles.logo} />
              </View>
            ) : null}
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNo}>{sale.invoice_number}</Text>
            <Text style={styles.invoiceMeta}>{dateLabel(sale.sale_date)}</Text>
          </View>
        </View>
        <View style={styles.goldLine} />

        {/* Centered shop info strip */}
        <View style={styles.infoStrip}>
          <Text style={styles.stripTagline}>{SHOP.tagline}</Text>
          <Text style={styles.stripCategories}>{SHOP.categories}</Text>
          <Text style={styles.stripContact}>
            {SHOP.address}   |   <Text style={styles.stripStrong}>{`${SHOP.phoneLabel}: ${SHOP.phone}`}</Text>
          </Text>
        </View>

        {/* Invoice / customer */}
        <View style={[styles.section, styles.infoRow]}>
          <View style={styles.infoBox}>
            <Text style={styles.boxLabel}>Invoice Details</Text>
            <Text style={styles.boxStrong}>{`No: ${sale.invoice_number}`}</Text>
            <Text style={styles.boxText}>{`Date: ${dateLabel(sale.sale_date)}`}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.boxLabel}>Billed To</Text>
            <Text style={styles.boxStrong}>{sale.customer_name}</Text>
            {sale.customer_address ? <Text style={styles.boxText}>{sale.customer_address}</Text> : null}
            <Text style={styles.boxText}>{`Ph: ${sale.customer_phone}`}</Text>
          </View>
          {sale.notes ? (
            <View style={styles.infoBox}>
              <Text style={styles.boxLabel}>Notes</Text>
              <Text style={styles.boxText}>{sale.notes}</Text>
            </View>
          ) : null}
        </View>

        {/* Items */}
        <View style={[styles.section, styles.table]}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.headerCell, styles.c1]}>#</Text>
            <Text style={[styles.headerCell, styles.c2]}>Saree</Text>
            <Text style={[styles.headerCell, styles.c3]}>Code</Text>
            <Text style={[styles.headerCell, styles.c4]}>Qty</Text>
            <Text style={[styles.headerCell, styles.c5]}>Price (Rs)</Text>
            <Text style={[styles.headerCell, styles.c6]}>Amount (Rs)</Text>
          </View>
          {items.map((item, index) => <InvoiceRow key={`${item.id}-${index}`} item={item} index={index} />)}
        </View>

        {/* Amount in words + totals */}
        <View style={[styles.section, styles.summary]} wrap={false}>
          <View style={styles.wordsPanel}>
            <Text style={styles.wordsLabel}>Amount in Words</Text>
            <Text style={styles.wordsText}>{amountInWords(total)}</Text>
          </View>
          <View style={styles.totalsPanel}>
            <View style={styles.totalLine}><Text>Subtotal</Text><Text style={styles.totalValue}>{money(subtotal)}</Text></View>
            {discount > 0 && (
              <View style={styles.totalLine}><Text>Discount</Text><Text style={styles.totalValue}>{`- ${money(discount)}`}</Text></View>
            )}
            <View style={styles.grandTotal}><Text style={styles.grandLabel}>GRAND TOTAL</Text><Text style={styles.grandValue}>{money(total)}</Text></View>
          </View>
        </View>

        {/* Payment + terms */}
        <View style={[styles.section, styles.lowerRow]} wrap={false}>
          <View style={styles.lowerBox}>
            <Text style={styles.boxLabel}>Payment Details</Text>
            {paymentRows.map(([key, value]) => (
              <View style={styles.detailRow} key={key}>
                <Text style={styles.detailKey}>{`${key}:`}</Text>
                <Text style={styles.detailValue}>{value}</Text>
              </View>
            ))}
          </View>
          {SHOW_TERMS && (
            <View style={styles.lowerBox}>
              <Text style={styles.boxLabel}>Terms & Care</Text>
              {TERMS.map((term, index) => <Text style={styles.term} key={term}>{`${index + 1}. ${term}`}</Text>)}
            </View>
          )}
        </View>

        {/* Pushes the signature down toward the footer */}
        <View style={styles.spacer} />

        <View style={styles.signature} wrap={false}>
          <Text style={styles.signatureName}>{`For ${SHOP.name}`}</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureSub}>Authorised Signatory</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Thank you for choosing us — may every drape be a celebration!</Text>
          <Text style={styles.footerSub}>{SHOP.motto}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateSareeInvoice(sale: Sale): Promise<Blob> {
  const logo = await loadLogo();
  return pdf(<InvoiceDocument sale={sale} logo={logo} />).toBlob();
}