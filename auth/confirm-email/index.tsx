import {
  SharedContentContainer,
  ConfirmationForm,
} from '@/components/auth-pages-components';
import Layout from '@/components/layout/layout';
import { Flex } from '@mantine/core';

export default function ConfirmEmail() {
  return (
    <Layout homePge={false} authPages>
      <Flex justify="center" align="center">
        <SharedContentContainer verifyEmail image="/images/verify-email.webp">
          <ConfirmationForm type="email" />
        </SharedContentContainer>
      </Flex>
    </Layout>
  );
}
