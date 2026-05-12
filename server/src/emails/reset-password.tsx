import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

interface ForgotPasswordEmailProps {
  resetUrl: string
  userName: string
  userEmail: string
}

export function ForgotPasswordEmail(props: ForgotPasswordEmailProps) {
  const { userName, userEmail, resetUrl } = props

  const currentYear = new Date().getFullYear()

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-zinc-100 font-sans py-[40px]">
          <Container className="bg-white w-[600px] p-[40px] rounded-[8px] mx-auto">
            {/* Header */}
            <Section className="text-center mb-[32px]">
              <Text className="text-[32px] font-bold text-gray-900 m-0">Reset Your Password</Text>
              <Text className="text-[16px] text-gray-600 mt-[8px] m-0">
                We received a request to reset your password
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Text className="text-[16px] text-gray-700 leading-[24px] mb-[16px]">
                Hello, {userName}
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] mb-[16px]">
                We received a request to reset the password for your account associated with{' '}
                <strong>{userEmail}</strong>.
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] mb-[24px]">
                Click the button below to create a new password. This link will expire in 24 hours
                for security purposes.
              </Text>
            </Section>

            {/* Reset Button */}
            <Section className="text-center mb-[32px]">
              <Button
                href={resetUrl}
                className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border hover:bg-blue-700"
              >
                Reset Password
              </Button>
            </Section>

            {/* Security Notice */}
            <Section className="bg-gray-50 p-[24px] rounded-[8px] mb-[32px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0 mb-[12px]">
                <strong>Security Notice:</strong>
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0">
                If you didn't request this password reset, please ignore this email. Your password
                will remain unchanged. For additional security, consider enabling two-factor
                authentication on your account.
              </Text>
            </Section>

            {/* Alternative Link */}
            <Section className="mb-[32px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] mb-[8px]">
                If the button doesn't work, copy and paste this link into your browser:
              </Text>
              <Text className="text-[14px] text-blue-600 break-all m-0">{resetUrl}</Text>
            </Section>

            <Hr className="border-gray-200 my-[32px]" />

            {/* Footer */}
            <Section>
              <Text className="text-[12px] text-gray-500 text-center leading-[16px] m-0 mb-[8px]">
                This email was sent to {userEmail}
              </Text>
              <Text className="text-[12px] text-gray-500 text-center leading-[16px] m-0 mb-[8px]">
                © {currentYear} Cards·Track Inc. All rights reserved.
              </Text>
              <Text className="text-[12px] text-gray-500 text-center leading-[16px] m-0">
                Cascavel, Ceará 62850-000
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
