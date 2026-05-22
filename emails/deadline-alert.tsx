import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface DeadlineAlertEmailProps {
  merchantName: string
  daysRemaining: number
  monthlyPaymentNeeded: string
  retroInterestExposure: string
  dealUrl: string
}

export function DeadlineAlertEmail({
  merchantName,
  daysRemaining,
  monthlyPaymentNeeded,
  retroInterestExposure,
  dealUrl,
}: DeadlineAlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {`${daysRemaining} days left — pay ${monthlyPaymentNeeded}/month to avoid ${retroInterestExposure} in retroactive interest on your ${merchantName} deal`}
      </Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', padding: '20px' }}>
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '32px',
          }}
        >
          <Heading style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            {daysRemaining} days left on your {merchantName} deal
          </Heading>
          <Text style={{ color: '#6b7280', marginBottom: '16px' }}>
            Your deferred-interest promotional period is ending soon.
          </Text>
          <Section
            style={{
              backgroundColor: '#fef2f2',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <Text style={{ fontSize: '18px', color: '#dc2626', margin: '0', fontWeight: 'bold' }}>
              If you miss the deadline: {retroInterestExposure} in retroactive interest
            </Text>
            <Text style={{ color: '#7f1d1d', margin: '8px 0 0', fontSize: '14px' }}>
              Charged on your original purchase amount — not your remaining balance.
            </Text>
          </Section>
          <Section
            style={{
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <Text style={{ fontSize: '18px', color: '#1d4ed8', margin: '0', fontWeight: 'bold' }}>
              Pay {monthlyPaymentNeeded}/month to pay it off in time
            </Text>
          </Section>
          <Button
            href={dealUrl}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: 'bold',
            }}
          >
            View your deal
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
