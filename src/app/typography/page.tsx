import { Alert, Card, Grid, PageHeader, Stack, Table } from '@convert/product-ui'
import type { Metadata } from 'next'
import styles from '@/components/guide.module.css'

export const metadata: Metadata = { title: 'Typography' }

export default function TypographyPage() {
  return (
    <Stack gap={32}>
      <PageHeader heading="Typography" description="Which typeface to use, and where." />
      <Grid columns={2} minItemWidth={300} align="stretch">
        <Card heading="Roobert" description="Primary typeface for headings, body copy and product interfaces.">
          <p className={styles.specimen} style={{ fontFamily: 'Roobert, var(--cui-font-sans)', fontWeight: 600 }}>
            Commerce that stacks up
          </p>
        </Card>
        <Card
          heading="Denton x Condensed"
          description="Serif for sparse marketing headings, like campaign lines. Never in product interfaces."
        >
          <p className={styles.specimen} style={{ fontFamily: '"Denton XCondensed", "Instrument Serif", serif' }}>
            Commerce that <em>stacks up</em>
          </p>
        </Card>
      </Grid>
      <Table caption="Where each typeface is used" layout="scroll">
        <thead>
          <tr>
            <th scope="col">Use</th>
            <th scope="col">Typeface</th>
            <th scope="col">Google alternative</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Brand headings and body copy</th>
            <td>Roobert</td>
            <td>Darker Grotesque</td>
          </tr>
          <tr>
            <th scope="row">Occasional campaign headings</th>
            <td>Denton x Condensed</td>
            <td>Instrument Serif</td>
          </tr>
          <tr>
            <th scope="row">Product and tool interfaces</th>
            <td>Roobert, falling back to Geist</td>
            <td>Not needed</td>
          </tr>
        </tbody>
      </Table>
      <Alert heading="Font downloads are coming later" tone="info">
        Roobert and Denton are licensed, so downloads arrive with company sign-in. Use the Google alternatives in Google
        Docs and Slides in the meantime.
      </Alert>
    </Stack>
  )
}
