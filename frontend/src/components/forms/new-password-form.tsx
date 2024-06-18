import { Alert, AlertDescription } from "@/components/core/alert";
import { Button } from "@/components/core/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import { newPasswordRequest } from "@/services/auth-service";
import {
  PasswordResetNewPasswordFormFields,
  passwordResetNewPasswordSchema,
} from "@/validation-schema/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { PasswordInput } from "../core/password-input";

interface NewPasswordFormProps {
  onSuccess: () => void;
  formTitle?: string;
}

const NewPasswordForm = ({ formTitle, onSuccess }: NewPasswordFormProps) => {
  const form = useForm<PasswordResetNewPasswordFormFields>({
    resolver: zodResolver(passwordResetNewPasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      newPassword: "",
      newPasswordConfirmation: "",
    },
  });

  const onSubmit: SubmitHandler<PasswordResetNewPasswordFormFields> = async ({
    newPassword,
    newPasswordConfirmation,
  }) => {
    if (!newPasswordConfirmation) {
      form.setError("newPasswordConfirmation", {
        message: "Confirm password",
      });
      return;
    }
    if (newPassword !== newPasswordConfirmation) {
      form.setError("newPasswordConfirmation", {
        message: "Password does not match",
      });
      return;
    }

    try {
      await newPasswordRequest({ newPassword });
      onSuccess();
    } catch (err: any) {
      if (err.errors) {
        form.setError("newPassword", { message: err.errors[0].message });
      }
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {formTitle !== undefined && (
            <div className="text-3xl text-gray-800 font-semibold mb-5">
              {formTitle}
            </div>
          )}

          {form.formState.errors.root && (
            <Alert colorScheme="destructive" className="mb-2">
              <AlertDescription>
                {form.formState.errors.root.serverCatch.message}
              </AlertDescription>
            </Alert>
          )}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="At least 12 characters"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPasswordConfirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="At least 12 characters"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-7">
            <Button
              type="submit"
              isLoading={
                form.formState.isSubmitting || form.formState.isSubmitSuccessful
              }
              fullWidth
            >
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewPasswordForm;
