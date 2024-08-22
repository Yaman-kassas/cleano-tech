import {
  NewPassForm,
  SharedContentContainer,
} from '@/components/auth-pages-components';
import Layout from '@/components/layout/layout';
import { Flex } from '@mantine/core';

export default function NewPassword() {
  return (
    <Layout homePge={false} authPages>
      <Flex justify="center" align="center">
        <SharedContentContainer forgotPass image="/images/verify-email.webp">
          <NewPassForm />
        </SharedContentContainer>
      </Flex>
    </Layout>
  );
}
