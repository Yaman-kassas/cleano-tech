/* eslint-disable react/jsx-key */
import { Grid, Stack, Text } from '@mantine/core';
import generalClasses from '../styles.module.scss';
import classes from './styles.module.scss';
import { ROUTES } from '@/data';
import { useForm, zodResolver } from '@mantine/form';
import { useRouter } from 'next/router';
import { SchemaType, postRegisterMutation } from '@/store/register';
import { useMutation } from '@tanstack/react-query';
import RadioInput from './radio-input';
import SharedInputs from '../shared-inputs';
import SharedConfirmButton from '../shared-confirm-button';
import useTranslation from 'next-translate/useTranslation';
import { getSchema } from '@/store/register/schema';

export default function SignUpForm() {
  const route = useRouter();
  const { t } = useTranslation();
  const registerUserInfo = useMutation({
    ...postRegisterMutation(),
  });

  const form = useForm<
    Omit<SchemaType, 'gender'> & { gender: SchemaType['gender'] | null }
  >({
    validate: zodResolver(getSchema(t)),
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      confirmPassword: '',
      gender: null,
    },
  });

  const SignUpData = [
    {
      label: t('common:Email'),
      logic: { ...form.getInputProps('email') },
      type: 'text',
      currentValue: form.values.email,
    },

    {
      label: t('common:FirstName'),
      logic: { ...form.getInputProps('firstName') },
      type: 'text',
      currentValue: form.values.firstName,
    },

    {
      label: t('common:LastName'),
      logic: { ...form.getInputProps('lastName') },
      type: 'text',
      currentValue: form.values.lastName,
    },

    {
      label: t('common:phoneNumber'),
      withOptional: true,
      logic: { ...form.getInputProps('phoneNumber') },
      type: 'tel',
      currentValue: form.values.phoneNumber,
    },

    {
      label: t('common:Password'),
      logic: { ...form.getInputProps('password') },
      type: 'password',
      currentValue: form.values.password,
    },

    {
      label: t('common:ConfirmPassword'),
      logic: { ...form.getInputProps('confirmPassword') },
      type: 'password',
      currentValue: form.values.confirmPassword,
    },
  ];

  const onSubmit = (values: SchemaType) => {
    const {
      phoneNumber,
      email,
      firstName,
      lastName,
      password,
      confirmPassword,
      gender,
    } = values;
    registerUserInfo
      .mutateAsync({
        password: confirmPassword === password ? password : '',
        email,
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        gender,
      })
      .then(() => {
        route.push(ROUTES.confirmEmail({ email }));
      });
  };

  return (
    <Stack className={generalClasses.largeStack}>
      <Text
        c="#233149"
        fw={800}
        ta="center"
        hiddenFrom="lg"
        className={generalClasses.title}
      >
        {t('common:wete')}
      </Text>
      <Stack className={classes.inputBox}>
        <Stack gap={32}>
          <Text c="#4985BB" fw={600} className={generalClasses.formTitle}>
            {t('common:Crnt')}
          </Text>
          <form
            onSubmit={form.onSubmit((data) => {
              onSubmit(data as SchemaType);
            })}
          >
            <Stack gap={80}>
              <Stack gap={32}>
                <Grid
                  gutter={{
                    base: 40,
                    sm: 41,
                    md: 66,
                    lg: 40,
                    xl: 40,
                  }}
                >
                  {SignUpData.map((v) => (
                    <Grid.Col
                      span={{
                        base: 12,
                        sm: 6,
                        md: 6,
                        lg: 6,
                        xl: 6,
                      }}
                    >
                      <Stack className={classes.gridGap}>
                        <SharedInputs
                          label={v.label}
                          key={v.label}
                          type={
                            v.type as 'text' | 'password' | 'tel' | 'number'
                          }
                          withOptional={v.withOptional}
                          currentValue={v.currentValue}
                          form={form}
                          logic={v.logic}
                          // rest={...m}
                        />
                      </Stack>
                    </Grid.Col>
                  ))}
                </Grid>
                <RadioInput {...form.getInputProps('gender')} />
              </Stack>
              <SharedConfirmButton
                btnTitle={t('common:Crnt')}
                linkTitle={t('common:SignIn')}
                href={ROUTES.login}
                desc={t('common:Alnt')}
                type="submit"
                disabled={registerUserInfo.isPending}
              />
            </Stack>
          </form>
        </Stack>
      </Stack>
    </Stack>
  );
}
