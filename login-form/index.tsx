import {
  Checkbox,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import generalClasses from '../styles.module.scss';
import classes from './styles.module.scss';
import Link from 'next/link';
import { ROUTES } from '@/data';
import { z } from 'zod';
import { useForm, zodResolver } from '@mantine/form';
import { signIn } from 'next-auth/react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/router';
import { useState } from 'react';
import SharedConfirmButton from '../shared-confirm-button';
import useTranslation from 'next-translate/useTranslation';
import { submitResendMutation } from '@/store/resend';
import { useMutation } from '@tanstack/react-query';

const schema = () => z.object({
  identifier: z
    .string()
    .email({ message: 'invalidEmail' ?? '' })
    .min(1, { message: 'required' ?? '' }),
  password: z
    .string()
    .min(6, { message: 'passwordSixCharacters' ?? '' })
    .min(1, { message: 'required' ?? '' }),
});

export default function LoginForm() {
  const route = useRouter();
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const form = useForm({
    validate: zodResolver(schema()),
    initialValues: {
      identifier: '',
      password: '',
    },
  });
  const submitResend = useMutation(submitResendMutation());
  const { t } = useTranslation();
  const onSubmit = async (formValues: {
    identifier: string;
    password: string;
  }) => {
    setLoading(true);
    const response = await signIn('credentials', {
      redirect: false,
      identifier: formValues.identifier,
      password: formValues.password,
      remember: checked,
    }).finally(() => {
      setLoading(false);
    });

    if (!response?.error && response?.ok && response.status === 200) {
      notifications.show({
        message: t('common:loly'),
        color: 'green',
      });
      route.push(ROUTES.root);
    } else if (response?.error === 'Email is not confirmed') {
      submitResend.mutate({
        email: formValues.identifier,
        type: 'register',
      });
      notifications.show({
        message: t('common:Emed'),
        color: 'red',
      });
      route.push(ROUTES.confirmEmail({ email: formValues.identifier }));
    } else {
      setLoading(false);
      notifications.show({
        message: response?.error,
        color: 'red',
      });
    }
  };

  return (
    <Stack className={generalClasses.largeStack}>
      {/* <Text
        c="#233149"
        fw={800}
        ta="center"
        hiddenFrom="lg"
        className={generalClasses.title}
      >
        {t('common:wete')}

      </Text> */}

      <Stack className={classes.formBox}>
        <Text c="#4985BB" fw={600} className={generalClasses.formTitle}>
          {t('common:siow')}
        </Text>
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack className={classes.inputBox}>
            <Stack className={classes.formItemsBox}>
              <TextInput
                variant="filled"
                label={t('common:Email')}
                {...form.getInputProps('identifier')}
                radius="24px 24px 24px 0"
                classNames={{
                  input: classes.input,
                  label: classes.label,
                }}
              />

              <Stack gap={8}>
                <PasswordInput
                  variant="filled"
                  label={t('common:Password')}
                  {...form.getInputProps('password')}
                  radius="24px 24px 24px 0"
                  classNames={{
                    input: classes.input,
                    label: classes.label,
                    section: classes.section,
                  }}
                />
                <Group justify="space-between">
                  <Checkbox
                    label={t('common:RememberMe')}
                    classNames={{ label: classes.checkBoxLabel }}
                    checked={checked}
                    onChange={(event) => setChecked(event.currentTarget.checked)}
                  />
                  <Text
                    component={Link}
                    href={ROUTES.forgetPassword}
                    fz={14}
                    fw={500}
                    td="underline"
                    c="#ED4444"
                  >
                    {t('common:ford')}
                  </Text>
                </Group>
              </Stack>
            </Stack>
            <SharedConfirmButton
              btnTitle={t('common:SignIn')}
              linkTitle={t('common:Crnt')}
              href={ROUTES.signup}
              desc={t('common:dont')}
              type="submit"
              disabled={loading}
            />
          </Stack>
        </form>
      </Stack>
    </Stack>
  );
}
